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


class AuthContext(BaseModel):
    """Holds all info which identifies an authenticated request."""

    employee: StoreEmployee
