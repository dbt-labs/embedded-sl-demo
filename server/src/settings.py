from pydantic_settings import BaseSettings, SettingsConfigDict


class SemanticLayerSettings(BaseSettings):
    """Semantic layer settings."""

    host: str
    environment_id: int
    token: str


class Settings(BaseSettings):
    """Settings for the app."""

    model_config = SettingsConfigDict(env_nested_delimiter="__")

    sl: SemanticLayerSettings


settings = Settings()  # type: ignore
