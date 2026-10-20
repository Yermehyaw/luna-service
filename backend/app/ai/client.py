import re

from pydantic import BaseModel

from app.core.config import settings

INTENT_LABELS = [
    "Billing and Payment",
    "Queue Booking and Delay",
    "Document Verification Issue",
    "General Inquiry",
    "Technical Bug",
]

IDEA_FALLBACKS = [
    "Customer success story: how {topic} improved our service",
    "Behind the scenes: how our team handles {topic}",
    "Quick tips: what customers should know about {topic}",
    "FAQ: {topic}, answered",
    "This week at Luna: {topic} in the spotlight",
]


class LunaModelError(Exception):
    pass


class SentimentResult(BaseModel):
    label: str
    score: float


class IntentResult(BaseModel):
    intent: str
    confidence: float


class LunaModelClient:
    def __init__(self, space_url: str | None = None, timeout: int = 90) -> None:
        self._space_url = (
            space_url if space_url is not None else settings.LUNA_MODEL_URL
        )
        self._timeout = timeout

    def _generate(self, prompt: str) -> str:
        if not self._space_url:
            raise LunaModelError("LUNA_MODEL_URL is not configured")

        try:
            from gradio_client import Client

            client = Client(self._space_url, verbose=False, timeout=self._timeout)
            raw = client.predict(prompt, api_name="/generate")
        except Exception as error:
            raise LunaModelError("Luna light model is unreachable") from error

        text = str(raw).strip()
        if not text:
            raise LunaModelError("Luna light model returned an empty response")
        return text

    def sentiment(self, text: str) -> SentimentResult:
        prompt = (
            "You are a strict sentiment classifier for customer messages.\n"
            "Classify the message below. Respond with exactly one word: "
            "POSITIVE or NEGATIVE.\n\n"
            f"Message: {text}\nLabel:"
        )
        raw = self._generate(prompt).upper()
        if "NEGATIVE" in raw:
            return SentimentResult(label="NEGATIVE", score=1.0)
        if "POSITIVE" in raw:
            return SentimentResult(label="POSITIVE", score=1.0)
        raise LunaModelError("Could not parse a sentiment label")

    def intent(self, text: str) -> IntentResult:
        labels = " | ".join(INTENT_LABELS)
        prompt = (
            "You are a strict intent classifier for customer messages.\n"
            "Choose the best label from this list and respond with only that "
            f"exact label:\n{labels}\n\n"
            f"Message: {text}\nLabel:"
        )
        raw = self._generate(prompt)
        lowered = raw.lower()
        matches = [label for label in INTENT_LABELS if label.lower() in lowered]
        if not matches:
            raise LunaModelError("Could not parse an intent label")

        best = max(matches, key=len)
        first_word = raw.split()[0].strip(",.:!?").lower() if raw.split() else ""
        score = 1.0 if first_word == best.split()[0].lower() else 0.6
        return IntentResult(intent=best, confidence=score)

    def suggest_reply(
        self, customer_msg: str, sentiment: str = "", intent: str = ""
    ) -> str:
        prompt = (
            "You are a polite customer support assistant for Luna.\n"
            f"Customer Sentiment: {sentiment or 'unknown'}\n"
            f"Customer Intent: {intent or 'General Inquiry'}\n"
            f"Customer Message: '{customer_msg}'\n"
            "Draft a short, helpful, 2-sentence response for the agent to send.\n"
            "Response:"
        )
        return self._generate(prompt)

    def content_ideas(self, topic: str, count: int = 3) -> list[str]:
        prompt = (
            "You are a social media content strategist for Luna.\n"
            f"Topic: {topic}\n"
            f"Write {count} short, engaging social media post ideas for this topic. "
            "Return one idea per line with no numbering.\nIdeas:"
        )
        raw = self._generate(prompt)
        ideas = [
            re.sub(r"^\s*(?:[-*o]|\d+[.)])\s*", "", line).strip()
            for line in raw.splitlines()
            if line.strip()
        ]
        ideas = [idea for idea in ideas if idea]
        if ideas:
            return ideas[:count]
        return [template.format(topic=topic) for template in IDEA_FALLBACKS[:count]]
