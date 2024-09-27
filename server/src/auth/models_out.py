from typing import Literal

from src.models import BaseModel


class OAuthLoginResponse(BaseModel):
    """Response from /auth."""

    class Config:  # pyright: ignore[reportIncompatibleVariableOverride]  # noqa: D106
        alias_generator = None

    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int


class User(BaseModel):
    """Response from /users."""

    id: int
    name: str
    store_location_name: str
    email: str
