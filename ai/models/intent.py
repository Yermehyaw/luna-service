from transformers import pipeline
from pydantic import BaseModel
from typing import List

class IntentResult(BaseModel):
    intent: str
    confidence: float

class IntentClassifier:
    def __init__(self, model_name: str = "facebook/bart-large-mnli"):
        print(f"[AI Engine] Loading Zero-Shot Intent Model: {model_name}...")
        self.classifier = pipeline("zero-shot-classification", model=model_name)
        self.candidate_labels = [
            "Billing and Payment",
            "Queue Booking and Delay",
            "Document Verification Issue",
            "General Inquiry",
            "Technical Bug"
        ]

    def classify(self, text: str) -> IntentResult:
        result = self.classifier(text, candidate_labels=self.candidate_labels)
        return IntentResult(
            intent=result["labels"][0],
            confidence=round(float(result["scores"][0]), 4)
        )

if __name__ == "__main__":
    classifier = IntentClassifier()
    test_msg = "My ticket payment went through but my queue position did not update!"
    print("Test Output:", classifier.classify(test_msg))