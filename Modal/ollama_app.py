import modal

OLLAMA_MODEL = "qwen2.5:3b"

image = modal.Image.from_registry(
    "ollama/ollama:latest", add_python="3.12"
).env({"OLLAMA_HOST": "0.0.0.0:11434"})

app = modal.App("luna-ollama", image=image)
models = modal.Volume.from_name("luna-ollama-models", create_if_missing=True)


@app.function(
    image=image,
    cpu=8,
    memory=12288,
    timeout=900,
    scaledown_window=300,
    volumes={"/root/.ollama": models},
)
@modal.web_server(port=11434, startup_timeout=900)
def serve():
    import subprocess
    import time
    import urllib.request

    subprocess.Popen("ollama serve", shell=True)

    for _ in range(120):
        try:
            urllib.request.urlopen("http://localhost:11434/api/tags", timeout=2)
            break
        except Exception:
            time.sleep(1)

    subprocess.run(["ollama", "pull", OLLAMA_MODEL], check=True)
    models.commit()
