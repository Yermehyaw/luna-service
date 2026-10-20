import re

import httpx

from app.core.config import settings

IDEA_FALLBACKS = [
    "Customer success story: how {topic} improved our service",
    "Behind the scenes: how our team handles {topic}",
    "Quick tips: what customers should know about {topic}",
    "FAQ: {topic}, answered",
    "This week at Luna: {topic} in the spotlight",
]


class LunaModelError(Exception):
    pass


class LunaModelClient:
    def __init__(
        self,
        base_url: str | None = None,
        api_key: str | None = None,
        model: str | None = None,
        timeout: float = 60.0,
    ) -> None:
        self._base_url = (base_url or settings.LUNA_MODEL_URL).rstrip("/")
        self._api_key = api_key if api_key is not None else settings.LUNA_MODEL_API_KEY
        self._model = model or settings.LUNA_MODEL_NAME
        self._timeout = timeout

    def _chat(self, system: str, user: str, max_tokens: int = 160) -> str:
        if not self._base_url or not self._api_key:
            raise LunaModelError(
                "LUNA_MODEL_URL or LUNA_MODEL_API_KEY is not configured"
            )

        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "max_tokens": max_tokens,
            "temperature": 0.7,
        }
        try:
            response = httpx.post(
                f"{self._base_url}/chat/completions",
                json=payload,
                headers={"Authorization": f"Bearer {self._api_key}"},
                timeout=self._timeout,
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
        except Exception as error:
            raise LunaModelError("Luna light model is unreachable") from error

        text = str(content).strip()
        if not text:
            raise LunaModelError("Luna light model returned an empty response")
        return text

    def suggest_reply(
        self, customer_msg: str, sentiment: str = "", intent: str = ""
    ) -> str:
        return self._chat(
            system=(
                "You are a polite customer support assistant for Luna. Draft a "
                "short, helpful, 2-sentence response for the agent to send."
            ),
            user=(
                f"Customer Sentiment: {sentiment or 'unknown'}\n"
                f"Customer Intent: {intent or 'General Inquiry'}\n"
                f"Customer Message: '{customer_msg}'"
            ),
        )

    def content_ideas(self, topic: str, count: int = 3) -> list[str]:
        raw = self._chat(
            system=(
                "You are a social media content strategist for Luna. Return one "
                "idea per line with no numbering."
            ),
            user=f"Topic: {topic}\nWrite {count} short, engaging post ideas.",
            max_tokens=256,
        )
        ideas = [
            re.sub(r"^\s*(?:[-*o]|\d+[.)])\s*", "", line).strip()
            for line in raw.splitlines()
            if line.strip()
        ]
        ideas = [idea for idea in ideas if idea]
        if ideas:
            return ideas[:count]
        return [template.format(topic=topic) for template in IDEA_FALLBACKS[:count]]
