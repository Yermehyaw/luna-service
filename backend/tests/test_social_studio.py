"""Unit and integration tests for Luna Social Studio (V1.0).

Verifies:
- ISocialProvider interfaces and contract models.
- Social Credit (SC) billing engine (inbound free, outbound 1 SC, 402 on deficit).
- Hexagonal adapters (Zernio, SocialAPI, Postproxy, ReminderMode).
- PWA Reminder Mode zero-cost publishing handoff payload.
- Webhook normalization from heterogeneous third-party providers.
- Realtime WebSocket channel isolation for social inboxes.
"""

import uuid
from datetime import datetime
import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from app.models.tenant import Business
from app.realtime.channels import social_inbox_channel
from app.social_studio import credit_manager
from app.social_studio.adapters.planvortex_adapter import PlanVortexAdapter
from app.social_studio.adapters.postproxy_api import PostproxyAdapter
from app.social_studio.adapters.reminder_mode import ReminderModeAdapter
from app.social_studio.adapters.socialapi_ai import SocialApiAdapter
from app.social_studio.adapters.zernio_api import ZernioAdapter
from app.social_studio.credit_manager import InsufficientCreditsError
from app.social_studio.interfaces import (
    DmReplyResult,
    LunaMessage,
    PostConfirmationResult,
    ProviderCapabilities,
    ScheduleResult,
    SocialAnalyticsData,
    SocialConversationSummary,
    SocialMessageItem,
)
from app.social_studio.webhook_parser import parse_webhook_payload


# --- Interface Contract Tests ---

def test_luna_message_contract():
    msg = LunaMessage(
        id="msg-123",
        business_id="biz-456",
        platform="instagram",
        author_handle="@ada",
        body="How do I book an appointment?",
        sentiment="neutral",
        intent="booking_request",
    )
    assert msg.id == "msg-123"
    assert msg.platform == "instagram"
    assert msg.status == "open"
    assert isinstance(msg.timestamp, datetime)


def test_social_analytics_contract():
    analytics = SocialAnalyticsData(
        business_id="biz-456",
        platform="all",
        period="7d",
        total_followers=1200,
        impressions=15000,
        engagement_rate=4.2,
    )
    assert analytics.total_followers == 1200
    assert analytics.sentiment_breakdown["positive"] == 0


def test_schedule_result_reminder_mode():
    res = ScheduleResult(
        success=True,
        post_id="post-789",
        status="reminder_queued",
        mode="REMINDER",
        platforms=["instagram", "tiktok"],
        reminder_payload={"caption": "Grand opening!", "share_handoff_url": "/pwa/handoff"},
    )
    assert res.mode == "REMINDER"
    assert res.status == "reminder_queued"
    assert "instagram" in res.platforms


# --- Social Credit (SC) Enforcement Tests ---

class MockScalarResult:
    def __init__(self, item):
        self.item = item

    def scalar_one_or_none(self):
        return self.item


class MockAsyncDbSession:
    """Lightweight in-memory async database session mock for fast unit tests."""

    def __init__(self, business: Business):
        self.business = business
        self.flushed = False

    async def execute(self, query):
        return MockScalarResult(self.business)

    async def flush(self):
        self.flushed = True


@pytest.mark.asyncio
async def test_credit_manager_allows_when_balance_sufficient():
    biz = Business(
        name="Acme Bank",
        subdomain="acme",
        social_credits=5,
        active_social_provider="zernio",
    )
    db = MockAsyncDbSession(biz)

    remaining = await credit_manager.validate_and_deduct_credits(
        db, business_id=str(biz.id), cost=1
    )
    assert remaining == 4
    assert biz.social_credits == 4
    assert db.flushed is True


@pytest.mark.asyncio
async def test_credit_manager_raises_402_when_balance_exhausted():
    biz = Business(
        name="Acme Bank",
        subdomain="acme",
        social_credits=0,
        active_social_provider="zernio",
    )
    db = MockAsyncDbSession(biz)

    with pytest.raises(HTTPException) as exc_info:
        await credit_manager.validate_and_deduct_credits(
            db, business_id=str(biz.id), cost=1
        )

    assert exc_info.value.status_code == 402
    detail = exc_info.value.detail
    assert detail["error"] == "insufficient_social_credits"
    assert detail["current_credits"] == 0
    assert detail["required_credits"] == 1


@pytest.mark.asyncio
async def test_credit_manager_get_balance_is_free():
    biz = Business(
        name="Acme Bank",
        subdomain="acme",
        social_credits=12,
        active_social_provider="zernio",
    )
    db = MockAsyncDbSession(biz)

    info = await credit_manager.get_credit_balance(db, str(biz.id))
    assert info["social_credits"] == 12
    assert info["is_locked"] is False
    assert info["is_trial_active"] is True
    # Verify balance was NOT decremented on read
    assert biz.social_credits == 12


@pytest.mark.asyncio
async def test_credit_manager_grant_credits():
    biz = Business(
        name="Acme Bank",
        subdomain="acme",
        social_credits=5,
        active_social_provider="zernio",
    )
    db = MockAsyncDbSession(biz)

    new_bal = await credit_manager.grant_social_credits(db, str(biz.id), amount=50)
    assert new_bal == 55
    assert biz.social_credits == 55


# --- Adapter & Reminder Mode Tests ---

@pytest.mark.asyncio
async def test_reminder_mode_adapter_schedule():
    adapter = ReminderModeAdapter(db=None)
    res = await adapter.schedule_post(
        business_id="biz-123",
        content="Exclusive weekend discount 20% off!",
        platforms=["instagram", "tiktok"],
        scheduled_for=datetime.utcnow(),
        media_url="https://images.unsplash.com/photo-1",
    )
    assert res.success is True
    assert res.mode == "REMINDER"
    assert res.status == "reminder_queued"
    assert res.reminder_payload["caption"] == "Exclusive weekend discount 20% off!"
    assert res.reminder_payload["media_url"] == "https://images.unsplash.com/photo-1"


@pytest.mark.asyncio
async def test_zernio_adapter_inbox_and_reply_fallback():
    adapter = ZernioAdapter(db=None)
    # 0 SC inbox read
    inbox = await adapter.get_inbox("biz-123")
    assert isinstance(inbox, list)

    # DM reply test
    reply_res = await adapter.send_dm_reply(
        business_id="biz-123",
        message_id="msg-456",
        reply_text="Hello Ada, we are open Monday to Friday 8am-5pm.",
    )
    assert reply_res.success is True
    assert reply_res.message_id == "msg-456"
    assert "zernio_sim_" in reply_res.external_id


@pytest.mark.asyncio
async def test_socialapi_and_postproxy_adapters_instantiation():
    s_adapter = SocialApiAdapter(db=None)
    p_adapter = PostproxyAdapter(db=None)

    s_analytics = await s_adapter.fetch_analytics("biz-123")
    p_analytics = await p_adapter.fetch_analytics("biz-123")

    # Overview totals contains no followers per official SocialAPI spec; 0 placeholder fabrication
    assert s_analytics.total_followers == 0
    assert s_analytics.impressions == 0
    assert p_analytics.total_followers == 0
    assert p_analytics.impressions == 0


# --- Webhook Normalization Tests ---

def test_webhook_parser_zernio():
    payload = {
        "event": "message.received",
        "data": {
            "id": "ext-z-101",
            "business_id": "biz-999",
            "platform": "instagram",
            "sender": "@uche_chukwu",
            "text": "What are your interest rates?",
            "media_url": None,
        },
    }
    msg = parse_webhook_payload("zernio", payload)
    assert msg.id == "ext-z-101"
    assert msg.business_id == "biz-999"
    assert msg.platform == "instagram"
    assert msg.author_handle == "@uche_chukwu"
    assert msg.body == "What are your interest rates?"


def test_webhook_parser_socialapi():
    payload = {
        "event_type": "new_dm",
        "message_id": "ext-s-202",
        "business_id": "biz-888",
        "network": "facebook",
        "sender_handle": "@emeka_banker",
        "text": "Please confirm my ticket status.",
    }
    msg = parse_webhook_payload("socialapi", payload)
    assert msg.id == "ext-s-202"
    assert msg.business_id == "biz-888"
    assert msg.platform == "facebook"
    assert msg.author_handle == "@emeka_banker"
    assert msg.body == "Please confirm my ticket status."


def test_webhook_parser_postproxy():
    payload = {
        "business_id": "biz-777",
        "message": {
            "id": "ext-p-303",
            "channel": "x",
            "from": "@chioma_dev",
            "content": "Can I pre-verify my BVN online?",
        },
    }
    msg = parse_webhook_payload("postproxy", payload)
    assert msg.id == "ext-p-303"
    assert msg.business_id == "biz-777"
    assert msg.platform == "x"
    assert msg.author_handle == "@chioma_dev"
    assert msg.body == "Can I pre-verify my BVN online?"


# --- Realtime Channel Tests ---

def test_social_inbox_channel_isolation():
    ch1 = social_inbox_channel("tenant-a")
    ch2 = social_inbox_channel("tenant-b")
    assert ch1 == "social:inbox:tenant-a"
    assert ch2 == "social:inbox:tenant-b"
    assert ch1 != ch2


# --- PlanVortex & Extended Provider Tests ---

@pytest.mark.asyncio
async def test_planvortex_adapter_inbox_and_reply():
    adapter = PlanVortexAdapter(db=None)
    inbox = await adapter.get_inbox("biz-pv-101")
    assert isinstance(inbox, list)

    res = await adapter.send_dm_reply(
        business_id="biz-pv-101",
        message_id="msg-pv-202",
        reply_text="Your ticket has been escalated to support.",
    )
    assert res.success is True
    assert res.message_id == "msg-pv-202"
    assert "planvortex_sim_" in res.external_id


def test_webhook_parser_planvortex():
    payload = {
        "event_id": "pv-evt-99",
        "org_id": "biz-pv-303",
        "channel": "instagram",
        "handle": "@ade_ola",
        "content": "Can I open an account with international passport?",
    }
    msg = parse_webhook_payload("planvortex", payload)
    assert msg.id == "pv-evt-99"
    assert msg.business_id == "biz-pv-303"
    assert msg.platform == "instagram"
    assert msg.author_handle == "@ade_ola"
    assert msg.body == "Can I open an account with international passport?"


@pytest.mark.asyncio
async def test_credit_manager_get_tenant_capabilities():
    biz = Business(
        name="Lekki Boutique",
        subdomain="lekki",
        social_credits=25,
        active_social_provider="socialapi",
        tier="free",
    )
    db = MockAsyncDbSession(biz)

    caps = await credit_manager.get_tenant_capabilities(db, str(biz.id))
    assert isinstance(caps, ProviderCapabilities)
    assert caps.publishing_mode == "REMINDER"
    assert caps.active_provider == "socialapi"
    assert caps.posts_limit_monthly == 10
    assert caps.interactions_limit_monthly == 50
    assert caps.social_credits_remaining == 25
    assert caps.is_locked is False
    assert caps.is_trial_active is True


def test_social_conversation_summary_contract():
    item = SocialMessageItem(
        id="item-1",
        sender="customer",
        authorName="Kemi",
        text="Hello, do you have branch in Ikeja?",
        timestamp="10:00 AM",
    )
    summary = SocialConversationSummary(
        id="conv-1",
        platform="instagram",
        authorName="Kemi",
        authorHandle="@kemi",
        avatarColor="from-purple-500 to-indigo-500",
        initialTime="10:00 AM",
        preview="Hello, do you have branch in Ikeja?",
        sentiment="neutral",
        category="General Inquiry",
        urgent=False,
        status="open",
        messages=[item],
    )
    assert summary.id == "conv-1"
    assert len(summary.messages) == 1
    assert summary.messages[0].sender == "customer"
    assert summary.query_type == "dm"
    assert summary.inbox_type == "dm"


def test_webhook_parser_types_classification():
    # 1. Comment webhook
    c_payload = {
        "event_type": "comment.received",
        "message_id": "sapi_cmt_888",
        "post_id": "post_123",
        "sender_handle": "@ade_client",
        "text": "What is the fee for this?",
    }
    c_msg = parse_webhook_payload("socialapi", c_payload)
    assert c_msg.query_type == "comment"
    assert c_msg.post_id == "post_123"

    # 2. Mention webhook
    m_payload = {
        "event_type": "mention.received",
        "message_id": "sapi_mnt_999",
        "metadata": {"media_id": "media_456"},
        "sender_handle": "@emeka_x",
        "text": "Loving @luna_hq!",
    }
    m_msg = parse_webhook_payload("socialapi", m_payload)
    assert m_msg.query_type == "mention"
    assert m_msg.post_id == "media_456"

    # 3. DM webhook
    d_payload = {
        "event_type": "dm.received",
        "message_id": "sapi_dm_111",
        "sender_handle": "@kemi_dm",
        "text": "Hello, need help.",
    }
    d_msg = parse_webhook_payload("socialapi", d_payload)
    assert d_msg.query_type == "dm"


@pytest.mark.asyncio
async def test_social_inbox_aggregated_types():
    from app.models.social import SocialQuery
    q_dm = SocialQuery(
        id=str(uuid.uuid4()),
        business_id="biz-multi",
        author_handle="@user1",
        body="DM message",
        query_type="dm",
    )
    q_cmt = SocialQuery(
        id=str(uuid.uuid4()),
        business_id="biz-multi",
        author_handle="@user2",
        body="Comment message",
        query_type="comment",
        post_id="post_99",
    )
    q_mnt = SocialQuery(
        id=str(uuid.uuid4()),
        business_id="biz-multi",
        author_handle="@user3",
        body="Mention message",
        query_type="mention",
        post_id="media_88",
    )

    class MultiMockDbSession:
        def __init__(self, queries):
            self.queries = queries
        async def execute(self, stmt):
            class Res:
                def __init__(self, q_list):
                    self.q_list = q_list
                def scalars(self):
                    class Sc:
                        def __init__(self, items):
                            self.items = items
                        def all(self):
                            return self.items
                    return Sc(self.q_list)
            # Inspect string representation of stmt to see if query_type filter was applied
            stmt_str = str(stmt)
            if "social_queries.query_type = :query_type_1" in stmt_str:
                # Filter matching query_type param
                # Extract value from bind params if possible, else check
                return Res([q for q in self.queries if q.query_type in ("comment", "mention", "dm")])
            return Res(self.queries)

    db_mock = MultiMockDbSession([q_dm, q_cmt, q_mnt])
    adapter = SocialApiAdapter(db=db_mock)
    
    # 1. Fetch "all": should return all 3
    all_inbox = await adapter.get_inbox("biz-multi", inbox_type="all")
    assert len(all_inbox) == 3
    types = {m.query_type for m in all_inbox}
    assert types == {"dm", "comment", "mention"}

    # Verify mention has can_reply=False and restriction reason
    mention_msg = next(m for m in all_inbox if m.query_type == "mention")
    assert mention_msg.can_reply is False
    assert "strict usage policies" in (mention_msg.reply_restriction_reason or "")


# --- Mention Reply Restrictions & Platform Capabilities ---

@pytest.mark.asyncio
async def test_mention_reply_rejected_across_adapters():
    """Verify core social media policy: mentions strictly cannot be replied to."""
    s_adapter = SocialApiAdapter(db=None)
    z_adapter = ZernioAdapter(db=None)
    p_adapter = PostproxyAdapter(db=None)
    pv_adapter = PlanVortexAdapter(db=None)

    for adapter in (s_adapter, z_adapter, p_adapter, pv_adapter):
        with pytest.raises(HTTPException) as exc_info:
            await adapter.send_dm_reply(
                business_id="biz-123",
                message_id="msg-mnt-1",
                reply_text="Thanks for mentioning us!",
                query_type="mention",
            )
        assert exc_info.value.status_code == 400
        assert "strict" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_capabilities_includes_granular_platform_matrix():
    """Verify platform capabilities matrix reflects varying platform support and restrictions."""
    biz = Business(
        name="Victoria Island Branch",
        subdomain="vi-branch",
        social_credits=50,
        active_social_provider="socialapi",
        tier="pro",
    )
    db = MockAsyncDbSession(biz)
    caps = await credit_manager.get_tenant_capabilities(db, str(biz.id))

    assert hasattr(caps, "platform_capabilities")
    p_caps = caps.platform_capabilities

    # Check key platforms exist
    for plat in ("instagram", "facebook", "x", "linkedin", "tiktok", "whatsapp"):
        assert plat in p_caps
        # Mentions cannot be replied to across all platforms per core API policies
        assert p_caps[plat].can_reply_mentions is False
        assert p_caps[plat].can_publish is True

    # Check platform-specific DM windows and restrictions
    assert p_caps["instagram"].dm_window_hours == 24
    assert p_caps["whatsapp"].dm_window_hours == 24
    assert p_caps["x"].dm_window_hours is None  # no strict 24h template window
    assert p_caps["linkedin"].supports_dm is False  # InMail not open via standard API


# --- Connected Accounts Gating (Free vs Pro Tier) ---

@pytest.mark.asyncio
async def test_connected_accounts_tier_gating():
    from app.models.social import SocialAccount
    from app.social_studio.interfaces import ConnectSocialAccountRequest
    from app.social_studio.router import connect_social_account

    # 1. Free tier business with 1 existing Instagram account
    existing_ig = SocialAccount(
        id=str(uuid.uuid4()),
        business_id="biz-free-1",
        platform="instagram",
        handle="@primary_store",
        display_name="Primary Store",
        is_connected=True,
    )
    biz_free = Business(
        name="Free Tier Shop",
        subdomain="free-shop",
        tier="free",
        social_credits=10,
    )

    class AccountMockSession:
        def __init__(self, business, accounts):
            self.business = business
            self.accounts = list(accounts)
            self.added = []

        async def execute(self, stmt):
            stmt_str = str(stmt)
            class Res:
                def __init__(self, items, single=None):
                    self.items = items
                    self.single = single
                def scalar_one_or_none(self):
                    return self.single
                def scalars(self):
                    class Sc:
                        def __init__(self, it):
                            self.it = it
                        def all(self):
                            return self.it
                    return Sc(self.items)

            if "businesses" in stmt_str:
                return Res([], single=self.business)
            elif "social_accounts" in stmt_str:
                # If checking specific handle
                if "social_accounts.handle = :handle_1" in stmt_str:
                    match = next((a for a in self.accounts if a.handle == "@second_store"), None)
                    return Res([], single=match)
                return Res(self.accounts)
            return Res([])

        def add(self, obj):
            self.added.append(obj)
            self.accounts.append(obj)

        async def commit(self):
            pass

        async def refresh(self, obj):
            if not getattr(obj, "id", None):
                obj.id = str(uuid.uuid4())
            if not getattr(obj, "created_at", None):
                obj.created_at = datetime.utcnow()

    # Attempting to add 2nd Instagram account on Free tier -> HTTP 403 pro_tier_required
    db_free = AccountMockSession(biz_free, [existing_ig])
    req_second = ConnectSocialAccountRequest(
        business_id="biz-free-1",
        platform="instagram",
        handle="@second_store",
        display_name="Secondary Outlet",
    )
    with pytest.raises(HTTPException) as exc_info:
        await connect_social_account(req_second, db=db_free)

    assert exc_info.value.status_code == 403
    assert exc_info.value.detail["error"] == "pro_tier_required"

    # 2. Pro tier business allows connecting second account on the same platform
    biz_pro = Business(
        name="Pro Enterprise Store",
        subdomain="pro-store",
        tier="pro",
        social_credits=100,
    )
    db_pro = AccountMockSession(biz_pro, [existing_ig])
    res_connected = await connect_social_account(req_second, db=db_pro)
    assert res_connected.handle == "@second_store"
    assert res_connected.platform == "instagram"
    assert res_connected.is_connected is True


# --- Manual Refresh / Inbox Sync ---

@pytest.mark.asyncio
async def test_manual_inbox_sync():
    from app.social_studio.router import sync_inbox

    adapter = ZernioAdapter(db=None)
    sync_res = await sync_inbox(business_id="biz-sync-1", platform="all", provider=adapter)
    assert sync_res["business_id"] == "biz-sync-1"
    assert sync_res["status"] == "synced"
    assert "synced_at" in sync_res
    assert isinstance(sync_res["message_count"], int)



