class TrendExtractor:
    @staticmethod
    def extract_top_issues(
        customer_messages: list[str], top_n: int = 5
    ) -> list[tuple[str, float]]:
        from sklearn.feature_extraction.text import TfidfVectorizer

        clean = [message for message in customer_messages if message.strip()]
        if not clean:
            return []

        vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        try:
            matrix = vectorizer.fit_transform(clean)
        except ValueError:
            return []

        scores = matrix.mean(axis=0).A1
        names = vectorizer.get_feature_names_out()
        order = scores.argsort()[::-1][:top_n]
        return [(str(names[index]), round(float(scores[index]), 4)) for index in order]
