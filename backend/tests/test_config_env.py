from app.core.config import Settings


def test_cors_origins_parse_from_a_real_dotenv_file(tmp_path):
    # pydantic-settings JSON-decodes list fields from dotenv before validators
    # run, so a plain comma-separated string used to raise SettingsError.
    env_file = tmp_path / ".env"
    env_file.write_text(
        "DATABASE_URL=postgresql+asyncpg://u:p@localhost:5432/test_db\n"
        "CORS_ORIGINS=http://localhost:3000,https://acme.luna.com\n",
        encoding="utf-8",
    )

    settings = Settings(_env_file=env_file)

    assert settings.CORS_ORIGINS == ["http://localhost:3000", "https://acme.luna.com"]


def test_single_cors_origin_without_commas_is_accepted(tmp_path):
    env_file = tmp_path / ".env"
    env_file.write_text("CORS_ORIGINS=http://localhost:3000\n", encoding="utf-8")

    assert Settings(_env_file=env_file).CORS_ORIGINS == ["http://localhost:3000"]


def test_empty_cors_origins_becomes_an_empty_list():
    assert Settings(CORS_ORIGINS="").CORS_ORIGINS == []
