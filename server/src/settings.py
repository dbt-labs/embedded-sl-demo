from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class SemanticLayerSettings(BaseSettings):
    """Semantic layer settings."""

    host: str
    environment_id: int
    token: str


class AuthSettings(BaseSettings):
    """Auth settings."""

    jwt_signing_secret: str
    jwt_algorithm: Literal["HS256"] = "HS256"
    jwt_expire_sec: int = 60 * 15


class Settings(BaseSettings):
    """Settings for the app."""

    model_config = SettingsConfigDict(env_nested_delimiter="__")

    sl: SemanticLayerSettings
    auth: AuthSettings
    cors_allow_origins: list[str]


settings = Settings()  # type: ignore
