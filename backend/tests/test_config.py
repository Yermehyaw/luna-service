from app.core.config import Settings


def test_cors_origins_parsed_from_comma_separated_string():
    settings = Settings(
        CORS_ORIGINS="http://localhost:3000, https://acme.luna.com,http://127.0.0.1:3000"
    )

    assert settings.CORS_ORIGINS == [
        "http://localhost:3000",
        "https://acme.luna.com",
        "http://127.0.0.1:3000",
    ]


def test_cors_origins_ignores_empty_entries():
    settings = Settings(CORS_ORIGINS="http://localhost:3000, ,  ,https://acme.luna.com")

    assert settings.CORS_ORIGINS == ["http://localhost:3000", "https://acme.luna.com"]


def test_cors_origins_accepts_a_list_unchanged():
    settings = Settings(CORS_ORIGINS=["https://one.luna.com", "https://two.luna.com"])

    assert settings.CORS_ORIGINS == ["https://one.luna.com", "https://two.luna.com"]


def test_database_echo_defaults_to_false():
    assert Settings().DATABASE_ECHO is False


def test_is_production_recognises_production_and_prod():
    assert Settings(ENVIRONMENT="production").is_production is True
    assert Settings(ENVIRONMENT="PROD").is_production is True


def test_is_production_false_for_development_and_test():
    assert Settings(ENVIRONMENT="development").is_production is False
    assert Settings(ENVIRONMENT="test").is_production is False


def test_modal_api_url_auto_configures_classifier_and_model_endpoints():
    settings = Settings(
        LUNA_MODAL_API_URL="https://myorg--luna-ai-api.modal.run"
    )
    assert settings.LUNA_CLASSIFIER_URL == "https://myorg--luna-ai-api.modal.run"
    assert settings.LUNA_MODEL_URL == "https://myorg--luna-ai-api.modal.run/v1"
    assert settings.LUNA_MODEL_NAME == "Qwen/Qwen2.5-3B-Instruct"


def test_modal_api_url_preserves_explicit_custom_overrides():
    settings = Settings(
        LUNA_MODAL_API_URL="https://myorg--luna-ai-api.modal.run",
        LUNA_CLASSIFIER_URL="https://custom-classifier.example.com",
        LUNA_MODEL_URL="https://custom-model.example.com/v1",
        LUNA_MODEL_NAME="custom-model",
    )
    assert settings.LUNA_CLASSIFIER_URL == "https://custom-classifier.example.com"
    assert settings.LUNA_MODEL_URL == "https://custom-model.example.com/v1"
    assert settings.LUNA_MODEL_NAME == "custom-model"

