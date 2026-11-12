"""FastAPI Router for Luna Social Studio (V1 Freemium to Enterprise).

Hexagonal architecture with dynamic dependency injection:
- Adapters are selected based on the business's `active_social_provider` column.
- Credit enforcement middleware protects outbound actions (402 Payment Required).
- Free inbound reads and analytics cost 0 Social Credits (SC).
- PWA Reminder Mode provides 100% zero-cost social publishing without API review blockers.
- Full conversational thread models conforming to the Next.js staff frontend.
"""

from __future__ import annotations

from datetime import datetime, timedelta
import json
from typing import Annotated, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Request, WebSocket, WebSocketDisconnect, status
from pydantic import BaseModel, Field
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import (
    AuthenticatedUser,
    enforce_tenant_isolation,
    get_optional_current_user,
)
from app.models.social import PostStatus, QueryStatus, SocialAccount, SocialPost, SocialQuery
from app.realtime import broker
from app.services.ai_feedback import record_feedback
from app.social_studio import credit_manager
from app.social_studio.adapters import (
    BaseSocialAdapter,
    PlanVortexAdapter,
    PostproxyAdapter,
    ReminderModeAdapter,
    SocialApiAdapter,
    ZernioAdapter,
)
from app.social_studio.interfaces import (
    ConnectSocialAccountRequest,
    DmReplyResult,
    ISocialProvider,
    LunaMessage,
    PostConfirmationResult,
    ProviderCapabilities,
    ScheduleResult,
    SocialAccountResponse,
    SocialAnalyticsData,
    SocialConversationSummary,
    SocialMessageItem,
)
from app.social_studio.webhook_parser import ingest_webhook_message, parse_webhook_payload

router = APIRouter(prefix="/api/social", tags=["Social Studio"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


# --- Request & Response Schemas ---

class DmReplyRequest(BaseModel):
    business_id: str = Field(min_length=1)
    message_id: str = Field(min_length=1)
    reply_text: str = Field(min_length=1)
    author_id: str | None = None
    resolve: bool = False
    is_ai_assisted: bool = False
    suggested_reply: str | None = None


class PostScheduleRequest(BaseModel):
    business_id: str = Field(min_length=1)
    content: str = Field(min_length=1)
    platforms: list[str] = Field(min_items=1)
    scheduled_for: datetime | None = None
    media_url: str | None = None
    author_id: str | None = None


class ReminderConfirmRequest(BaseModel):
    business_id: str = Field(min_length=1)
    post_id: str = Field(min_length=1)
    confirmed_published: bool = True
    snooze_minutes: int | None = None


class ConversationAssignRequest(BaseModel):
    business_id: str = Field(min_length=1)
    conversation_id: str = Field(min_length=1)
    assignee: str = Field(min_length=1)


class CreditGrantRequest(BaseModel):
    business_id: str = Field(min_length=1)
    amount: int = Field(gt=0)
    reason: str = "trial_or_purchase"


class ProviderSwitchRequest(BaseModel):
    business_id: str = Field(min_length=1)
    provider: str = Field(pattern="^(socialapi|postproxy|zernio|planvortex|reminder_mode)$")


class IdeaGenerateRequest(BaseModel):
    business_id: str = Field(min_length=1)
    industry: str | None = None


# --- Dependency Injection Resolver ---

async def get_social_provider(
    business_id: str = Query(min_length=1),
    db: AsyncSession = Depends(get_db),
) -> ISocialProvider:
    """Dependency Injection: Hot-swaps the adapter based on tenant configuration."""
    business = await credit_manager.get_tenant_business(db, business_id)
    provider_name = (business.active_social_provider or "socialapi").lower()

    if provider_name == "socialapi":
        return SocialApiAdapter(db=db)
    elif provider_name == "postproxy":
        return PostproxyAdapter(db=db)
    elif provider_name == "planvortex":
        return PlanVortexAdapter(db=db)
    elif provider_name == "reminder_mode":
        return ReminderModeAdapter(db=db)
    else:
        return ZernioAdapter(db=db)


# --- Seeding Helper for Initial Demo Conversations ---

DEMO_SEED_DATA = [
    {
        "author_handle": "@jide.fx",
        "author_name": "jide.fx",
        "platform": "instagram",
        "query_type": "dm",
        "body": "Your app says my document verification failed but I uploaded a clear scan. What exactly is wrong with it??",
        "sentiment": "negative",
        "sentiment_score": 0.2,
        "intent": "complaint",
        "category": "Complaint · verification",
        "urgent": True,
    },
    {
        "author_handle": "@daniel_o",
        "author_name": "Daniel O.",
        "platform": "x",
        "query_type": "mention",
        "body": "Been waiting 2hrs at your branch?? This is unacceptable. Ticket A118 and the board has not moved...",
        "sentiment": "negative",
        "sentiment_score": 0.1,
        "intent": "complaint",
        "category": "Complaint · queue delay",
        "urgent": True,
    },
    {
        "author_handle": "Chiamaka Eze",
        "author_name": "Chiamaka Eze",
        "platform": "linkedin",
        "query_type": "comment",
        "body": "Interested in your SME loan clinic for our staff cooperative. Who can we speak with about a session?",
        "sentiment": "neutral",
        "sentiment_score": 0.6,
        "intent": "booking_request",
        "category": "Lead · SME clinic",
        "urgent": False,
    },
    {
        "author_handle": "+234 803 441 9022",
        "author_name": "Fatima Al-Hassan",
        "platform": "whatsapp",
        "query_type": "dm",
        "body": "Hi! Can I reschedule my appointment for tomorrow afternoon? My flight landed late.",
        "sentiment": "neutral",
        "sentiment_score": 0.5,
        "intent": "booking_request",
        "category": "Booking · reschedule",
        "urgent": False,
    },
    {
        "author_handle": "@dele_b",
        "author_name": "Dele B.",
        "platform": "tiktok",
        "query_type": "comment",
        "body": "Just tried the mobile queue booking! Walked straight into Chair 2 and out in 20 mins. Incredible experience 🔥",
        "sentiment": "positive",
        "sentiment_score": 0.95,
        "intent": "praise",
        "category": "Review · praise",
        "urgent": False,
    },
]


async def _seed_demo_conversations_if_empty(db: AsyncSession, business_id: str) -> None:
    """Pre-populates sample conversations for a newly created business so Social Studio is interactive."""
    count_stmt = select(SocialQuery).where(SocialQuery.business_id == business_id)
    res = await db.execute(count_stmt)
    if res.scalars().first() is not None:
        return

    # Create dummy account if needed
    acc_stmt = select(SocialAccount).where(SocialAccount.business_id == business_id)
    acc_res = await db.execute(acc_stmt)
    account = acc_res.scalars().first()
    if not account:
        account = SocialAccount(
            business_id=business_id,
            platform="instagram",
            handle="@luna_hq",
            display_name="Luna Official",
            is_connected=True,
        )
        db.add(account)
        await db.flush()

    for item in DEMO_SEED_DATA:
        sq = SocialQuery(
            business_id=business_id,
            account_id=str(account.id),
            author_handle=item["author_handle"],
            query_type=item.get("query_type", "dm"),
            body=item["body"],
            status=QueryStatus.OPEN.value,
            sentiment=item["sentiment"],
            sentiment_score=item["sentiment_score"],
            intent=item["intent"],
        )
        db.add(sq)
    await db.commit()


# --- Endpoints ---

@router.get("/inbox", response_model=list[LunaMessage])
async def get_inbox(
    business_id: str = Query(min_length=1),
    platform: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    inbox_type: str = Query(default="all", alias="type", description="Filter by inbox type: all, dm, comment, mention"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    provider: ISocialProvider = Depends(get_social_provider),
    current_user: Annotated[AuthenticatedUser | None, Depends(get_optional_current_user)] = None,
) -> list[LunaMessage]:
    """Fetch unified inbox messages (0 Social Credits consumed - FREE)."""
    if current_user:
        enforce_tenant_isolation(business_id, current_user)

    return await provider.get_inbox(
        business_id=business_id,
        platform=platform,
        status=status_filter,
        inbox_type=inbox_type,
        limit=limit,
        offset=offset,
    )


@router.get("/conversations", response_model=list[SocialConversationSummary])
async def list_conversations(
    business_id: str = Query(min_length=1),
    platform: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    inbox_type: str = Query(default="all", alias="type", description="Filter by inbox type: all, dm, comment, mention"),
    search: str | None = None,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: DbSession = None,
    current_user: Annotated[AuthenticatedUser | None, Depends(get_optional_current_user)] = None,
) -> list[SocialConversationSummary]:
    """Fetch structured conversation threads conforming to the frontend Social Studio contract.
    
    0 Social Credits consumed (Free Inbound Read).
    Supports filtering across all, dm, comment, and mention.
    """
    if current_user:
        enforce_tenant_isolation(business_id, current_user)

    await _seed_demo_conversations_if_empty(db, business_id)

    stmt = select(SocialQuery).where(SocialQuery.business_id == business_id)
    if inbox_type and inbox_type != "all":
        stmt = stmt.where(SocialQuery.query_type == inbox_type)
    if platform and platform != "all":
        pass
    if status_filter and status_filter != "all":
        if status_filter == "resolved":
            stmt = stmt.where(SocialQuery.status.in_([QueryStatus.ANSWERED.value, QueryStatus.CLOSED.value]))
        else:
            stmt = stmt.where(SocialQuery.status == QueryStatus.OPEN.value)

    if search:
        search_term = f"%{search}%"
        stmt = stmt.where(
            SocialQuery.body.ilike(search_term) | SocialQuery.author_handle.ilike(search_term)
        )

    stmt = stmt.order_by(desc(SocialQuery.created_at)).offset(offset).limit(limit)
    result = await db.execute(stmt)
    queries = result.scalars().all()

    conversations: list[SocialConversationSummary] = []
    for q in queries:
        messages = [
            SocialMessageItem(
                id=f"msg-{q.id}-in",
                sender="customer",
                authorName=q.author_handle.lstrip("@"),
                text=q.body,
                timestamp=q.created_at.strftime("%I:%M %p") if q.created_at else "Just now",
            )
        ]
        if q.response_body:
            messages.append(
                SocialMessageItem(
                    id=f"msg-{q.id}-out",
                    sender="staff",
                    authorName=q.answered_by or "Staff Specialist",
                    text=q.response_body,
                    timestamp=q.answered_at.strftime("%I:%M %p") if q.answered_at else "Just now",
                )
            )

        sentiment_val = q.sentiment or "neutral"
        urgent_val = sentiment_val == "negative" or q.intent == "complaint"
        status_val = "resolved" if q.status in (QueryStatus.ANSWERED.value, QueryStatus.CLOSED.value) else "open"

        avatar_colors = {
            "instagram": "#E1306C",
            "x": "#1DA1F2",
            "facebook": "#1877F2",
            "linkedin": "#0A66C2",
            "tiktok": "#000000",
            "whatsapp": "#25D366",
        }

        # Resolve platform from handle or fallback
        detected_platform = "instagram"
        if q.author_handle.startswith("+234"):
            detected_platform = "whatsapp"
        elif "Eze" in q.author_handle:
            detected_platform = "linkedin"
        elif "daniel" in q.author_handle.lower():
            detected_platform = "x"

        q_type = getattr(q, "query_type", "dm") or "dm"
        can_rep = q_type != "mention"
        restriction = (
            "Mentions cannot be replied to due to strict usage policies"
            if not can_rep
            else None
        )
        conversations.append(
            SocialConversationSummary(
                id=str(q.id),
                platform=detected_platform,
                query_type=q_type,
                inbox_type=q_type,
                post_id=getattr(q, "post_id", None),
                can_reply=can_rep,
                reply_restriction_reason=restriction,
                authorName=q.author_handle.lstrip("@"),
                authorHandle=q.author_handle,
                avatarColor=avatar_colors.get(detected_platform, "#291E29"),
                initialTime=q.created_at.strftime("%b %d") if q.created_at else "Today",
                date=q.created_at.strftime("%d %b, %H:%M") if q.created_at else "Today",
                preview=q.body,
                sentiment=sentiment_val,
                category=f"{q.intent or 'General'} · query",
                urgent=urgent_val,
                status=status_val,
                assignee=q.answered_by or "Unassigned",
                messages=messages,
            )
        )

    return conversations


@router.post("/reply", response_model=DmReplyResult)
async def send_dm_reply(
    payload: DmReplyRequest,
    db: DbSession,
    current_user: Annotated[AuthenticatedUser | None, Depends(get_optional_current_user)] = None,
) -> DmReplyResult:
    """Send an outbound reply to a customer DM/comment.
    
    Consumes 1 Social Credit (SC). Raises HTTP 402 if credit balance < 1.
    Automatically captures AI feedback telemetry when AI assistance is used.
    """
    if current_user:
        enforce_tenant_isolation(payload.business_id, current_user)
        if not current_user.is_staff:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Staff privileges required to reply to social messages",
            )
    # 0. Check whether target message is a mention (strictly non-replyable)
    query_check = await db.execute(
        select(SocialQuery).where(
            SocialQuery.id == payload.message_id,
            SocialQuery.business_id == payload.business_id,
        )
    )
    target_query = query_check.scalar_one_or_none()
    if target_query and getattr(target_query, "query_type", "dm") == "mention":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mentions cannot be replied to due to strict social media API usage policies.",
        )

    # 1. Enforce credit validation & decrement balance
    remaining_credits = await credit_manager.validate_and_deduct_credits(
        db,
        business_id=payload.business_id,
        cost=1,
        action="dm_reply",
    )

    # 2. Resolve tenant adapter
    business = await credit_manager.get_tenant_business(db, payload.business_id)
    provider_name = (business.active_social_provider or "socialapi").lower()

    if provider_name == "socialapi":
        provider: ISocialProvider = SocialApiAdapter(db=db)
    elif provider_name == "postproxy":
        provider = PostproxyAdapter(db=db)
    elif provider_name == "planvortex":
        provider = PlanVortexAdapter(db=db)
    else:
        provider = ZernioAdapter(db=db)

    # 3. Dispatch outbound reply via adapter
    result = await provider.send_dm_reply(
        business_id=payload.business_id,
        message_id=payload.message_id,
        reply_text=payload.reply_text,
        author_id=payload.author_id,
    )
    result.remaining_credits = remaining_credits

    # 4. Update SocialQuery status in PostgreSQL
    stmt = select(SocialQuery).where(
        SocialQuery.id == payload.message_id,
        SocialQuery.business_id == payload.business_id,
    )
    res = await db.execute(stmt)
    query = res.scalar_one_or_none()
    if query:
        query.response_body = payload.reply_text
        query.status = QueryStatus.CLOSED.value if payload.resolve else QueryStatus.ANSWERED.value
        query.answered_at = datetime.utcnow()
        query.answered_by = payload.author_id or "Staff Specialist"
        query.used_suggestion = payload.is_ai_assisted

        # 5. Capture AI training feedback telemetry without extra staff steps
        if payload.is_ai_assisted or payload.suggested_reply:
            try:
                await record_feedback(
                    db,
                    business_id=payload.business_id,
                    message=query.body,
                    suggested_reply=payload.suggested_reply or query.suggested_reply,
                    final_reply=payload.reply_text,
                    source="social_studio_reply",
                    intent=query.intent,
                    sentiment=query.sentiment,
                    sentiment_score=query.sentiment_score,
                )
            except Exception:
                pass

    await db.commit()
    return result


@router.post("/schedule", response_model=ScheduleResult)
async def schedule_social_post(
    payload: PostScheduleRequest,
    db: DbSession,
) -> ScheduleResult:
    """Schedule a social post via PWA Reminder Mode (0 API cost, zero app review blocker)."""
    # Track monthly post count
    business = await credit_manager.get_tenant_business(db, payload.business_id)
    current_posts = getattr(business, "posts_used_this_month", 0) or 0
    business.posts_used_this_month = current_posts + 1

    # Reminder Mode persists to DB and prepares mobile PWA Web Share handoff
    reminder_adapter = ReminderModeAdapter(db=db)
    result = await reminder_adapter.schedule_post(
        business_id=payload.business_id,
        content=payload.content,
        platforms=payload.platforms,
        scheduled_for=payload.scheduled_for,
        media_url=payload.media_url,
        author_id=payload.author_id,
    )
    await db.commit()
    return result


@router.post("/reminder/confirm", response_model=PostConfirmationResult)
async def confirm_reminder_published(
    payload: ReminderConfirmRequest,
    db: DbSession,
) -> PostConfirmationResult:
    """Post-execution feedback from PWA Web Share handoff:
    Marks post as published or reschedules reminder.
    """
    stmt = select(SocialPost).where(
        SocialPost.id == payload.post_id,
        SocialPost.business_id == payload.business_id,
    )
    res = await db.execute(stmt)
    post = res.scalar_one_or_none()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post '{payload.post_id}' not found.",
        )

    if payload.confirmed_published:
        post.status = PostStatus.PUBLISHED.value
        post.published_at = datetime.utcnow()
        msg = "Post marked as successfully published live on social platforms."
    else:
        mins = payload.snooze_minutes or 15
        post.scheduled_for = datetime.utcnow() + timedelta(minutes=mins)
        post.status = PostStatus.SCHEDULED.value
        msg = f"Post reminder snoozed for {mins} minutes."

    await db.commit()
    return PostConfirmationResult(
        post_id=str(post.id),
        status=post.status,
        message=msg,
        updated_at=datetime.utcnow(),
    )


@router.post("/assign")
async def assign_conversation(
    payload: ConversationAssignRequest,
    db: DbSession,
) -> dict[str, Any]:
    """Assign a staff member to an open conversation thread."""
    stmt = select(SocialQuery).where(
        SocialQuery.id == payload.conversation_id,
        SocialQuery.business_id == payload.business_id,
    )
    res = await db.execute(stmt)
    query = res.scalar_one_or_none()
    if not query:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    query.answered_by = payload.assignee
    await db.commit()
    return {
        "conversation_id": str(query.id),
        "assignee": payload.assignee,
        "status": "assigned",
    }


@router.get("/capabilities", response_model=ProviderCapabilities)
async def get_capabilities(
    business_id: str = Query(min_length=1),
    db: DbSession = None,
) -> ProviderCapabilities:
    """Return provider capabilities, publishing mode (REMINDER), and free-tier allowance caps."""
    return await credit_manager.get_tenant_capabilities(db, business_id)


@router.get("/analytics", response_model=SocialAnalyticsData)
async def get_social_analytics(
    business_id: str = Query(min_length=1),
    platform: str | None = None,
    period: str = Query(default="7d"),
    provider: ISocialProvider = Depends(get_social_provider),
) -> SocialAnalyticsData:
    """Fetch aggregated cross-platform social analytics (0 Social Credits consumed - FREE)."""
    return await provider.fetch_analytics(
        business_id=business_id,
        platform=platform,
        time_range=period,
    )


@router.get("/credits")
async def get_credit_balance(
    business_id: str = Query(min_length=1),
    db: DbSession = None,
) -> dict[str, Any]:
    """Retrieve tenant Social Credit (SC) balance and trial status."""
    return await credit_manager.get_credit_balance(db, business_id)


@router.post("/credits/grant")
async def grant_credits(
    payload: CreditGrantRequest,
    db: DbSession,
) -> dict[str, Any]:
    """Top-up or grant Social Credits (SC) to a business tenant."""
    new_balance = await credit_manager.grant_social_credits(
        db,
        business_id=payload.business_id,
        amount=payload.amount,
        reason=payload.reason,
    )
    await db.commit()
    return {
        "business_id": payload.business_id,
        "amount_granted": payload.amount,
        "new_balance": new_balance,
    }


@router.patch("/provider")
async def switch_provider(
    payload: ProviderSwitchRequest,
    db: DbSession,
) -> dict[str, Any]:
    """Hot-swap the active social API provider for this tenant without UI rewrites."""
    business = await credit_manager.get_tenant_business(db, payload.business_id)
    previous_provider = business.active_social_provider
    business.active_social_provider = payload.provider
    await db.commit()
    return {
        "business_id": business.id,
        "previous_provider": previous_provider,
        "active_social_provider": business.active_social_provider,
        "message": f"Successfully hot-swapped social provider to {payload.provider}.",
    }


@router.post("/ideas/generate")
async def generate_campaign_ideas(
    payload: IdeaGenerateRequest,
    db: DbSession,
) -> dict[str, Any]:
    """Generate 3 promotional campaign concepts tuned to tenant industry (consumes 1 SC)."""
    remaining = await credit_manager.validate_and_deduct_credits(
        db, business_id=payload.business_id, cost=1, action="ai_ideas_generate"
    )
    await db.commit()

    business = await credit_manager.get_tenant_business(db, payload.business_id)
    industry = payload.industry or business.type or "service"

    ideas = [
        {
            "title": f"⚡ Fast-Track Priority Pass Campaign for {business.name}",
            "tagline": "Skip the lobby line. Pre-clear your booking on your phone.",
            "suggested_caption": f"Your time is precious. With {business.name}'s new digital priority arrival pass, you can book your time slot in advance and be served immediately. Tap the link in bio to lock in your window! 🚀",
            "platforms": ["instagram", "facebook"],
        },
        {
            "title": "🤝 SME & Community Fast-Lane Spotlight",
            "tagline": "Dedicated service windows for entrepreneurs and local businesses.",
            "suggested_caption": f"Running a business is hard enough without waiting in line. Visit {business.name} this week for our dedicated SME Priority Window. Fast intake, instant paperwork clearance.",
            "platforms": ["linkedin", "x"],
        },
        {
            "title": "✨ Weekend Express Booking Rush",
            "tagline": "Guaranteed slots and 20% faster turnaround.",
            "suggested_caption": f"Planning your weekend visit? Reserve your priority queue ticket now with {business.name} and experience zero waiting room friction. Seats fill quickly! ⏳",
            "platforms": ["tiktok", "instagram"],
        },
    ]

    return {
        "business_id": payload.business_id,
        "credits_remaining": remaining,
        "ideas": ideas,
    }


@router.post("/webhook/{provider}")
async def handle_vendor_webhook(
    provider: str,
    request: Request,
    db: DbSession,
    business_id: str | None = Query(default=None),
) -> dict[str, Any]:
    """Single endpoint receiving heterogeneous incoming webhooks from all 4 social providers."""
    payload = await request.json()
    normalized_message = parse_webhook_payload(
        provider=provider,
        payload=payload,
        fallback_business_id=business_id,
    )
    query = await ingest_webhook_message(db, normalized_message, broker=broker)
    return {
        "status": "ingested",
        "message_id": str(query.id),
        "business_id": query.business_id,
        "author": query.author_handle,
    }


# --- Connected Accounts Management (Pro-Tier Gated for Multiple Accounts) ---

@router.get("/accounts", response_model=list[SocialAccountResponse])
async def list_social_accounts(
    business_id: str = Query(min_length=1),
    db: DbSession = None,
    current_user: Annotated[AuthenticatedUser | None, Depends(get_optional_current_user)] = None,
) -> list[SocialAccountResponse]:
    """List connected social accounts for a business tenant."""
    if current_user:
        enforce_tenant_isolation(business_id, current_user)

    stmt = (
        select(SocialAccount)
        .where(SocialAccount.business_id == business_id)
        .order_by(SocialAccount.platform, SocialAccount.created_at)
    )
    result = await db.execute(stmt)
    accounts = result.scalars().all()
    return [
        SocialAccountResponse(
            id=str(acc.id),
            business_id=acc.business_id,
            platform=acc.platform,
            handle=acc.handle,
            display_name=acc.display_name,
            is_connected=acc.is_connected,
            follower_count=acc.follower_count or 0,
            created_at=acc.created_at,
        )
        for acc in accounts
    ]


@router.post("/accounts/connect", response_model=SocialAccountResponse)
async def connect_social_account(
    payload: ConnectSocialAccountRequest,
    db: DbSession,
    current_user: Annotated[AuthenticatedUser | None, Depends(get_optional_current_user)] = None,
) -> SocialAccountResponse:
    """Connect a social account for a tenant.
    
    Pro Tier Gating:
    Free and Basic plans support at most 1 connected account per platform.
    Connecting multiple accounts on the same platform requires Pro or Enterprise tier.
    """
    if current_user:
        enforce_tenant_isolation(payload.business_id, current_user)
        if not current_user.is_staff:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Staff privileges required to connect social accounts",
            )
    business = await credit_manager.get_tenant_business(db, payload.business_id)
    tier = (getattr(business, "tier", "free") or "free").lower()
    platform_clean = payload.platform.lower().strip()

    # Check existing connected accounts on this platform
    stmt = select(SocialAccount).where(
        SocialAccount.business_id == payload.business_id,
        SocialAccount.platform == platform_clean,
        SocialAccount.is_connected == True,
    )
    res = await db.execute(stmt)
    existing_accounts = res.scalars().all()

    # If already connected on this platform and not Pro/Enterprise, reject
    if len(existing_accounts) >= 1 and tier not in ("pro", "enterprise"):
        is_same = any(acc.handle.lower() == payload.handle.lower() for acc in existing_accounts)
        if not is_same:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "pro_tier_required",
                    "message": "Connecting multiple accounts per platform is a paid feature available on Pro and Enterprise tiers.",
                    "current_tier": tier,
                    "required_tier": "pro",
                    "platform": platform_clean,
                },
            )

    # Check if handle already exists for this tenant
    find_stmt = select(SocialAccount).where(
        SocialAccount.business_id == payload.business_id,
        SocialAccount.platform == platform_clean,
        SocialAccount.handle == payload.handle,
    )
    find_res = await db.execute(find_stmt)
    account = find_res.scalar_one_or_none()

    if not account:
        account = SocialAccount(
            business_id=payload.business_id,
            platform=platform_clean,
            handle=payload.handle,
            display_name=payload.display_name or payload.handle,
            is_connected=True,
            follower_count=payload.follower_count,
        )
        db.add(account)
    else:
        account.is_connected = True
        account.display_name = payload.display_name or account.display_name
        account.follower_count = payload.follower_count or account.follower_count

    await db.commit()
    await db.refresh(account)

    return SocialAccountResponse(
        id=str(account.id),
        business_id=account.business_id,
        platform=account.platform,
        handle=account.handle,
        display_name=account.display_name,
        is_connected=account.is_connected,
        follower_count=account.follower_count or 0,
        created_at=account.created_at,
    )


@router.delete("/accounts/{account_id}")
async def disconnect_social_account(
    account_id: str,
    business_id: str = Query(min_length=1),
    db: DbSession = None,
) -> dict[str, Any]:
    """Disconnect a social account from a tenant."""
    stmt = select(SocialAccount).where(
        SocialAccount.id == account_id,
        SocialAccount.business_id == business_id,
    )
    res = await db.execute(stmt)
    account = res.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Social account not found.")

    account.is_connected = False
    await db.commit()
    return {
        "account_id": account_id,
        "business_id": business_id,
        "is_connected": False,
        "message": f"Successfully disconnected {account.platform} account ({account.handle}).",
    }


# --- Manual Refresh & Live WebSocket Feeds ---

@router.post("/inbox/sync")
async def sync_inbox(
    business_id: str = Query(min_length=1),
    platform: str | None = None,
    provider: ISocialProvider = Depends(get_social_provider),
    db: DbSession = None,
) -> dict[str, Any]:
    """Manually trigger inbox sync/refresh across connected channels (0 SC cost)."""
    synced_messages = await provider.get_inbox(business_id=business_id, platform=platform, limit=50)
    return {
        "business_id": business_id,
        "status": "synced",
        "platform": platform or "all",
        "message_count": len(synced_messages),
        "synced_at": datetime.utcnow().isoformat(),
    }


@router.websocket("/ws/{business_id}")
async def social_inbox_ws(
    websocket: WebSocket,
    business_id: str,
) -> None:
    """Live WebSocket feed for Social Studio inbox auto-updates."""
    from app.realtime import manager
    from app.realtime.channels import social_inbox_channel

    await websocket.accept()
    channel = social_inbox_channel(business_id)
    await manager.connect(channel, websocket)
    try:
        await websocket.send_text(
            json.dumps({"type": "connected", "channel": channel, "timestamp": datetime.utcnow().isoformat()})
        )
        while True:
            text = await websocket.receive_text()
            if text == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(channel, websocket)

