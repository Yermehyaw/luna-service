import os
from huggingface_hub import InferenceClient

class SuggestedReplyGenerator:
    def __init__(self, token: str = None):
        hf_token = token or os.getenv("HUGGINGFACE_API_KEY")
        self.client = InferenceClient(
            model="microsoft/Phi-3-mini-4k-instruct",
            token=hf_token
        )

    def generate(self, customer_msg: str, sentiment: str, intent: str) -> str:
        prompt = (
            f"<|system|>\nYou are a polite customer support assistant for Luna.<|end|>\n"
            f"<|user|>\nCustomer Intent: {intent}\nCustomer Sentiment: {sentiment}\n"
            f"Customer Message: '{customer_msg}'\n"
            f"Draft a short, helpful, 2-sentence response for the agent to send:<|end|>\n"
            f"<|assistant|>"
        )
        try:
            response = self.client.text_generation(prompt, max_new_tokens=100, temperature=0.6)
            return response.strip()
        except Exception:
            return f"Hello, thank you for reaching out. We have received your query regarding {intent.lower()} and our staff is working to resolve it."