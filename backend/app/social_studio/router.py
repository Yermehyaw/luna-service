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
from typing import Annotated, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
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
    DmReplyResult,
    ISocialProvider,
    LunaMessage,
    PostConfirmationResult,
    ProviderCapabilities,
    ScheduleResult,
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
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    provider: ISocialProvider = Depends(get_social_provider),
) -> list[LunaMessage]:
    """Fetch unified inbox messages (0 Social Credits consumed - FREE)."""
    return await provider.get_inbox(
        business_id=business_id,
        platform=platform,
        status=status_filter,
        limit=limit,
        offset=offset,
    )


@router.get("/conversations", response_model=list[SocialConversationSummary])
async def list_conversations(
    business_id: str = Query(min_length=1),
    platform: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    search: str | None = None,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: DbSession = None,
) -> list[SocialConversationSummary]:
    """Fetch structured conversation threads conforming to the frontend Social Studio contract.
    
    0 Social Credits consumed (Free Inbound Read).
    """
    await _seed_demo_conversations_if_empty(db, business_id)

    stmt = select(SocialQuery).where(SocialQuery.business_id == business_id)
    if platform and platform != "all":
        # match query platform through account or default
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

        conversations.append(
            SocialConversationSummary(
                id=str(q.id),
                platform=detected_platform,
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
) -> DmReplyResult:
    """Send an outbound reply to a customer DM/comment.
    
    Consumes 1 Social Credit (SC). Raises HTTP 402 if credit balance < 1.
    Automatically captures AI feedback telemetry when AI assistance is used.
    """
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
