from keybert import KeyBERT
from typing import List, Tuple

class TrendExtractor:
    def __init__(self):
        print("[AI Pipeline] Initializing KeyBERT Trend Extractor...")
        self.kw_model = KeyBERT('all-MiniLM-L6-v2')

    def extract_top_issues(self, customer_messages: List[str], top_n: int = 5) -> List[Tuple[str, float]]:
        combined_text = " ".join(customer_messages)
        if not combined_text.strip():
            return []
        
        keywords = self.kw_model.extract_keywords(
            combined_text,
            keyphrase_ngram_range=(1, 2),
            stop_words='english',
            top_n=top_n
        )
        return [(kw, round(float(score), 4)) for kw, score in keywords]

if __name__ == "__main__":
    extractor = TrendExtractor()
    sample_feedback = [
        "The wait time in Ikeja branch is way too long.",
        "Document upload failed when verifying my national ID.",
        "System crashed while booking a queue ticket.",
        "Extremely long wait times for afternoon appointments."
    ]
    print("Top Emerging Trends:", extractor.extract_top_issues(sample_feedback))