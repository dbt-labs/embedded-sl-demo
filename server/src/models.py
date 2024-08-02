from pydantic import BaseModel


class StoreEmployee(BaseModel):
    """A jaffle shop store employee."""

    id: int
    name: str
    store_location_name: str


class AuthContext(BaseModel):
    """Holds all info which identifies an authenticated request."""

    employee: StoreEmployee
