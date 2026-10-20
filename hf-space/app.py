import gradio as gr
from transformers import pipeline

MODEL_ID = "Qwen/Qwen2.5-0.5B-Instruct"

generator = pipeline("text-generation", model=MODEL_ID)


def generate(prompt: str) -> str:
    result = generator(
        prompt,
        max_new_tokens=256,
        do_sample=True,
        temperature=0.7,
        return_full_text=False,
    )
    return result[0]["generated_text"].strip()


with gr.Blocks(title="Luna Light Model") as demo:
    prompt_box = gr.Textbox(label="Prompt", lines=8)
    out_box = gr.Textbox(label="Response", lines=8)
    btn = gr.Button("Generate")
    btn.click(fn=generate, inputs=prompt_box, outputs=out_box, api_name="/generate")

if __name__ == "__main__":
    demo.launch()
