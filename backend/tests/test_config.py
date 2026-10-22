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
