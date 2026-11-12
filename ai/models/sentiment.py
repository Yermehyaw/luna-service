from transformers import pipeline
from pydantic import BaseModel

class SentimentResult(BaseModel):
    label: str
    score: float

class SentimentClassifier:
    def __init__(self, model_name: str = "distilbert-base-uncased-finetuned-sst-2-english"):
        print(f"[AI Engine] Loading Sentiment Model: {model_name}...")
        self.analyzer = pipeline("sentiment-analysis", model=model_name)

    def analyze(self, text: str) -> SentimentResult:
        result = self.analyzer(text)[0]
        return SentimentResult(
            label=result["label"],
            score=round(float(result["score"]), 4)
        )

if __name__ == "__main__":
    classifier = SentimentClassifier()
    test_msg = "The queue was moving so slowly and no staff was around to assist me."
    print("Test Output:", classifier.analyze(test_msg))