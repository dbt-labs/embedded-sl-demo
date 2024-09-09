import base64
import datetime as dt
import json
import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Annotated

from dbtsl.asyncio import AsyncSemanticLayerClient
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import src.out_models as out
from src.db import db
from src.models import AuthContext, StoreEmployee
from src.settings import settings

sl = AsyncSemanticLayerClient(
    environment_id=settings.sl.environment_id,
    host=settings.sl.host,
    auth_token=settings.sl.token,
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Setup a global SL session."""
    async with sl.session():
        yield


BEARER_PREFIX = "Bearer "


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

    if not authorization.startswith(BEARER_PREFIX):
        raise unauthorized

    token = authorization[len(BEARER_PREFIX) :]

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=json.loads(os.environ["CORS_ALLOW_ORIGINS"]),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


BASIC_PREFIX = "Basic "


@app.post("/auth", response_model=out.User)
async def login(authorization: Annotated[str | None, Header()]) -> StoreEmployee:
    """Get an existing user if username and password match."""
    unauthorized = HTTPException(status_code=401)
    if authorization is None:
        raise unauthorized

    if not authorization.startswith(BASIC_PREFIX):
        raise unauthorized

    encoded_identity = authorization[len(BASIC_PREFIX) :]

    try:
        identity_str = base64.b64decode(encoded_identity).decode("utf-8")
        email, password = identity_str.split(":")
    except ValueError:
        raise HTTPException(status_code=400)

    user = db.get_user_by_email_and_password(email, password)
    if user is None:
        raise unauthorized

    return user


@app.get("/users/me", response_model=out.User)
async def get_me(auth: AuthDependency) -> StoreEmployee:
    """Show the current user."""
    return auth.employee


@app.get("/orders/daily")
async def get_orders(auth: AuthDependency) -> out.MetricsGroupedBy[dt.date, float]:
    """Get a buffer with daily orders for the current shop."""
    metric = "order_total"
    group_by = "metric_time__day"

    table = await sl.query(
        metrics=[metric],
        where=[f"{{{{ Dimension('location__location_name') }}}} = '{auth.employee.store_location_name}'"],
        group_by=[group_by],
    )

    return out.MetricsGroupedBy[dt.date, float].from_arrow(group_by, [metric], table)
