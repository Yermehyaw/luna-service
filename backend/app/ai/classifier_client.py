import httpx
from pydantic import BaseModel

from app.core.config import settings


class ClassifierServiceError(Exception):
    pass


class SentimentResult(BaseModel):
    label: str
    score: float


class IntentResult(BaseModel):
    intent: str
    confidence: float


class ClassifierClient:
    def __init__(self, base_url: str | None = None, timeout: float = 120.0) -> None:
        self._base_url = (base_url or settings.LUNA_CLASSIFIER_URL).rstrip("/")
        self._timeout = timeout

    def _post(self, path: str, text: str) -> dict:
        if not self._base_url:
            raise ClassifierServiceError("LUNA_CLASSIFIER_URL is not configured")

        try:
            response = httpx.post(
                f"{self._base_url}{path}",
                json={"text": text},
                timeout=self._timeout,
            )
            response.raise_for_status()
            return response.json()
        except Exception as error:
            raise ClassifierServiceError("Luna classifier VM is unreachable") from error

    def sentiment(self, text: str) -> SentimentResult:
        body = self._post("/sentiment", text)
        try:
            return SentimentResult(label=body["label"], score=float(body["score"]))
        except Exception as error:
            raise ClassifierServiceError("Malformed sentiment response") from error

    def intent(self, text: str) -> IntentResult:
        body = self._post("/intent", text)
        try:
            return IntentResult(
                intent=body["intent"], confidence=float(body["confidence"])
            )
        except Exception as error:
            raise ClassifierServiceError("Malformed intent response") from error
