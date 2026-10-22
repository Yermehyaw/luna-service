import modal

SENTIMENT_MODEL = "distilbert-base-uncased-finetuned-sst-2-english"
INTENT_MODEL = "facebook/bart-large-mnli"
QWEN_MODEL = "Qwen/Qwen2.5-3B-Instruct"
CANDIDATE_LABELS = [
    "Billing and Payment",
    "Queue Booking and Delay",
    "Document Verification Issue",
    "General Inquiry",
    "Technical Bug",
]

image = (
    modal.Image.debian_slim(python_version="3.12")
    .pip_install("torch==2.5.1", index_url="https://download.pytorch.org/whl/cpu")
    .pip_install("transformers", "accelerate", "fastapi[standard]")
)

app = modal.App("luna-ai", image=image)
hf_cache = modal.Volume.from_name("luna-hf-cache", create_if_missing=True)


@app.function(
    image=image,
    cpu=8,
    memory=12288,
    timeout=600,
    volumes={"/root/.cache/huggingface": hf_cache},
)
@modal.asgi_app()
def api():
    from functools import lru_cache
    from uuid import uuid4

    import torch
    from fastapi import FastAPI
    from pydantic import BaseModel
    from transformers import (
        AutoModelForCausalLM,
        AutoTokenizer,
        pipeline,
    )

    web = FastAPI(title="Luna AI (Modal)")

    class TextPayload(BaseModel):
        text: str

    @lru_cache(maxsize=1)
    def sentiment_pipeline():
        return pipeline("sentiment-analysis", model=SENTIMENT_MODEL)

    @lru_cache(maxsize=1)
    def intent_pipeline():
        return pipeline("zero-shot-classification", model=INTENT_MODEL)

    @lru_cache(maxsize=1)
    def qwen():
        tokenizer = AutoTokenizer.from_pretrained(QWEN_MODEL)
        model = AutoModelForCausalLM.from_pretrained(
            QWEN_MODEL, torch_dtype=torch.bfloat16
        )
        model.eval()
        return tokenizer, model

    @web.get("/")
    def root():
        return {"status": "ok", "service": "luna-ai"}

    @web.get("/v1/models")
    def models():
        return {
            "object": "list",
            "data": [{"id": QWEN_MODEL, "object": "model", "owned_by": "luna"}],
        }

    @web.post("/sentiment")
    def sentiment(payload: TextPayload):
        result = sentiment_pipeline()(payload.text)[0]
        return {"label": result["label"], "score": round(float(result["score"]), 4)}

    @web.post("/intent")
    def intent(payload: TextPayload):
        result = intent_pipeline()(payload.text, candidate_labels=CANDIDATE_LABELS)
        return {
            "intent": result["labels"][0],
            "confidence": round(float(result["scores"][0]), 4),
        }

    @web.post("/v1/chat/completions")
    def chat_completions(payload: dict):
        messages = payload.get("messages") or []
        max_tokens = int(payload.get("max_tokens") or 256)
        temperature = float(payload.get("temperature", 0.7))

        tokenizer, model = qwen()
        prompt = tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        inputs = tokenizer(prompt, return_tensors="pt")
        with torch.no_grad():
            output = model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                do_sample=temperature > 0,
                temperature=max(temperature, 1e-5),
                top_p=0.9,
                pad_token_id=tokenizer.eos_token_id,
            )
        prompt_len = inputs["input_ids"].shape[1]
        completion = output[0][prompt_len:]
        content = tokenizer.decode(completion, skip_special_tokens=True).strip()

        return {
            "id": f"chatcmpl-{uuid4().hex[:24]}",
            "object": "chat.completion",
            "created": 0,
            "model": payload.get("model") or QWEN_MODEL,
            "choices": [
                {
                    "index": 0,
                    "message": {"role": "assistant", "content": content},
                    "finish_reason": "stop",
                }
            ],
            "usage": {
                "prompt_tokens": int(prompt_len),
                "completion_tokens": int(completion.shape[0]),
                "total_tokens": int(prompt_len + completion.shape[0]),
            },
        }

    return web
