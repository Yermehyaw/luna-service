from pydantic import BaseModel

DEFAULT_CANDIDATE_LABELS = [
    "Billing and Payment",
    "Queue Booking and Delay",
    "Document Verification Issue",
    "General Inquiry",
    "Technical Bug",
]


class IntentResult(BaseModel):
    intent: str
    confidence: float


class IntentClassifier:
    def __init__(
        self,
        model_name: str = "facebook/bart-large-mnli",
        candidate_labels: list[str] | None = None,
    ) -> None:
        from transformers import pipeline

        self._classifier = pipeline("zero-shot-classification", model=model_name)
        self._candidate_labels = candidate_labels or DEFAULT_CANDIDATE_LABELS

    def classify(self, text: str) -> IntentResult:
        result = self._classifier(text, candidate_labels=self._candidate_labels)
        return IntentResult(
            intent=result["labels"][0],
            confidence=round(float(result["scores"][0]), 4),
        )
