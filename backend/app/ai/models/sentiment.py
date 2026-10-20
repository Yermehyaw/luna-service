from pydantic import BaseModel


class SentimentResult(BaseModel):
    label: str
    score: float


class SentimentClassifier:
    def __init__(
        self,
        model_name: str = "distilbert-base-uncased-finetuned-sst-2-english",
    ) -> None:
        from transformers import pipeline

        self._analyzer = pipeline("sentiment-analysis", model=model_name)

    def analyze(self, text: str) -> SentimentResult:
        result = self._analyzer(text)[0]
        return SentimentResult(
            label=result["label"],
            score=round(float(result["score"]), 4),
        )
