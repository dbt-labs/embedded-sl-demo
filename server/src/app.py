from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Annotated

from dbtsl.asyncio import AsyncSemanticLayerClient
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic.main import BaseModel

from src.db import db
from src.models import AuthContext
from src.settings import settings

sl = AsyncSemanticLayerClient(
    environment_id=settings.sl.environment_id,
    host=settings.sl.host,
    auth_token=settings.sl.token,
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:  # noqa: D
    """Setup a global SL session."""
    async with sl.session():
        yield


AUTH_PREFIX = "Bearer "


def auth(authorization: Annotated[str | None, Header()]) -> AuthContext:
    """Dependency resolver for authentication.

    Note that this is not "secure", since this is just a demo app.
    The user simply needs to pass `Authorization: Bearer <user_id>`
    to authorize as the user with that ID. In a real application,
    you probably want to do proper auth and get the user ID from the
    token.
    """
    unauthorized = HTTPException(status_code=401)
    if authorization is None:
        raise unauthorized

    if not authorization.startswith(AUTH_PREFIX):
        raise unauthorized

    token = authorization[len(AUTH_PREFIX) :]

    try:
        user_id = int(token)
    except ValueError:
        raise unauthorized

    user = db.get_user(user_id)
    if user is None:
        raise unauthorized

    return AuthContext(employee=user)


AuthDependency = Annotated[AuthContext, Depends(auth)]


app = FastAPI(lifespan=lifespan)


class UserOutput(BaseModel):
    id: int
    name: str
    store_location_name: str


@app.get("/users/me")
async def get_me(auth: AuthDependency) -> UserOutput:
    """Show the current user."""
    return auth.employee


@app.get("/orders")
async def get_orders(auth: AuthDependency) -> str:
    """Get an Arrow buffer with daily orders for the current shop."""
    # TODO: add streaming query with record batches to the SDK
    # this should simplify this logic
    table = await sl.query(
        metrics=["order_total"],
        where=[f"{{{{ Dimension('location__location_name') }}}} = '{auth.employee.store_location_name}'"],
        group_by=["metric_time__day"],
    )
    print(table)
    # TODO: stream results to client
    return "ok"
