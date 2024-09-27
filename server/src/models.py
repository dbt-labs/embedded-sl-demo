import datetime as dt
import math

from pydantic import BaseModel as PydanticBaseModel


def to_camel(s: str) -> str:
    """Convert a snake_case string to a camelCase one."""
    tokens = s.split("_")
    tokens_camel = [tokens[0]] + [t.title() for t in tokens[1:]]
    return "".join(tokens_camel)


class BaseModel(PydanticBaseModel):
    """Base class for all models with some config overrides."""

    class Config:  # noqa: D106
        alias_generator = to_camel
        populate_by_name = True


class StoreEmployee(BaseModel):
    """A jaffle shop store employee."""

    id: int
    name: str
    store_location_name: str

    email: str
    password: str


class JWTClaims(BaseModel):
    """The claims contained in a JWT token used for auth."""

    sub: int
    iat: int
    exp: int
    # NOTE: if this was a more complex application with RBAC, you'd probably
    # want to add a `scope` field with OAuth scopes.
    # See: https://oauth.net/2/scope/

    @classmethod
    def from_user_id(cls, user_id: int, expiration_seconds: int) -> "JWTClaims":
        """Create JWT claims for a given user."""
        now = math.floor(dt.datetime.now(dt.UTC).timestamp())
        return cls(
            sub=user_id,
            iat=now,
            exp=now + expiration_seconds,
        )


class AuthContext(BaseModel):
    """Holds all info which identifies an authenticated request."""

    employee: StoreEmployee
