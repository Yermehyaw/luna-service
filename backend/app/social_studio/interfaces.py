"""Abstract Base Classes (Ports) and Data Contracts for Social Studio.

Hexagonal Architecture: This file defines the port (`ISocialProvider`) and data models
that all adapters (Zernio, SocialAPI.ai, Postproxy, ReminderMode, future native Meta/TikTok)
must conform to. Core business logic and UI depend exclusively on this interface.
"""

from __future__ import annotations

import abc
from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field


class LunaMessage(BaseModel):
    """Normalized inbound social message/DM across any connected platform."""

    id: str
    business_id: str
    account_id: str | None = None
    platform: str  # instagram, facebook, x, whatsapp, tiktok, threads
    author_handle: str
    author_name: str | None = None
    body: str
    media_url: str | None = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    sentiment: str | None = None  # positive, neutral, negative
    sentiment_score: float | None = None
    intent: str | None = None  # complaint, refund_request, booking_request, etc.
    suggested_reply: str | None = None
    status: str = "open"  # open, answered, escalated, closed
    thread_id: str | None = None
    raw_payload: dict[str, Any] | None = None


class SocialAnalyticsData(BaseModel):
    """Normalized engagement and audience analytics for a tenant."""

    business_id: str
    platform: str | None = "all"
    period: str = "7d"
    total_followers: int = 0
    impressions: int = 0
    reach: int = 0
    engagement_rate: float = 0.0
    queries_received: int = 0
    average_response_time_minutes: float = 0.0
    sentiment_breakdown: dict[str, int] = Field(
        default_factory=lambda: {"positive": 0, "neutral": 0, "negative": 0}
    )
    top_topics: list[str] = Field(default_factory=list)
    raw_metrics: dict[str, Any] | None = None


class DmReplyResult(BaseModel):
    """Result of an outbound DM or comment reply."""

    success: bool
    message_id: str
    reply_body: str
    external_id: str | None = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    credits_deducted: int = 1
    remaining_credits: int | None = None
    error: str | None = None


class ScheduleResult(BaseModel):
    """Result of post scheduling or reminder mode queuing."""

    success: bool
    post_id: str
    status: str  # draft | scheduled | reminder_queued | pending_confirmation | published | missed_reminder
    scheduled_for: datetime | None = None
    platforms: list[str] = Field(default_factory=list)
    mode: str = "REMINDER"  # REMINDER (PWA zero-cost) or DIRECT_API
    reminder_payload: dict[str, Any] | None = None
    error: str | None = None


class SocialMessageItem(BaseModel):
    """Individual message bubble inside a conversation thread."""

    id: str
    sender: str  # customer | staff | ai
    authorName: str
    text: str
    timestamp: str


class SocialConversationSummary(BaseModel):
    """Full conversation model conforming to frontend SocialConversation contract."""

    id: str
    platform: str  # instagram | x | facebook | linkedin | tiktok | whatsapp
    authorName: str
    authorHandle: str
    avatarColor: str = "#291E29"
    initialTime: str = "Just now"
    date: str = ""
    preview: str
    sentiment: str = "neutral"  # negative | neutral | positive
    category: str = "General Inquiry"
    urgent: bool = False
    status: str = "open"  # open | urgent | resolved
    assignee: str = "Unassigned"
    messages: list[SocialMessageItem] = Field(default_factory=list)


class ProviderCapabilities(BaseModel):
    """Reflects active social API capabilities, publishing mode, and free-tier limits."""

    tenant_id: str
    active_provider: str  # socialapi | postproxy | zernio | planvortex
    publishing_mode: str  # REMINDER | DIRECT_API
    inbox_supported: bool = True
    analytics_supported: bool = True
    posts_limit_monthly: int = 10
    interactions_limit_monthly: int = 50
    posts_remaining: int = 10
    interactions_remaining: int = 50
    social_credits_remaining: int = 50
    tier: str = "free"
    is_trial_active: bool = True
    is_locked: bool = False


class PostConfirmationResult(BaseModel):
    """Result of marking a reminder mode post as published or rescheduled."""

    post_id: str
    status: str
    message: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ISocialProvider(abc.ABC):
    """The Port: Interface that all Social Studio vendor adapters must implement."""

    @abc.abstractmethod
    async def get_inbox(
        self,
        business_id: str,
        platform: str | None = None,
        status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[LunaMessage]:
        """Fetch unified inbox messages/DMs for a business (0 Social Credits consumed)."""
        pass

    @abc.abstractmethod
    async def send_dm_reply(
        self,
        business_id: str,
        message_id: str,
        reply_text: str,
        author_id: str | None = None,
    ) -> DmReplyResult:
        """Send an outbound reply to a customer DM/comment (Consumes 1 Social Credit)."""
        pass

    @abc.abstractmethod
    async def fetch_analytics(
        self,
        business_id: str,
        platform: str | None = None,
        time_range: str = "7d",
    ) -> SocialAnalyticsData:
        """Fetch cross-platform social analytics for a business (0 Social Credits consumed)."""
        pass

    @abc.abstractmethod
    async def schedule_post(
        self,
        business_id: str,
        content: str,
        platforms: list[str],
        scheduled_for: datetime | None = None,
        media_url: str | None = None,
        author_id: str | None = None,
    ) -> ScheduleResult:
        """Schedule a post via PWA Reminder Mode or direct vendor API."""
        pass
