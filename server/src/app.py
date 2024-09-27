import asyncio
import datetime as dt
import json
import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Annotated

import jwt
import pyarrow as pa
from dbtsl.asyncio import AsyncSemanticLayerClient
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestFormStrict

import src.out_models as out
from src.db import db
from src.models import AuthContext, JWTClaims, StoreEmployee
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


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=json.loads(os.environ["CORS_ALLOW_ORIGINS"]),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


JWT_SIGN_ALGORITHM = "HS256"
JWT_EXPIRE_SECONDS = 60 * 15  # 15min access token expiration
JWT_DECODE_OPTIONS = {"require": ["exp", "iat", "sub"]}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def decode_token(token: str) -> JWTClaims:
    """Decode a JWT token, raise 401 if token is invalid."""
    try:
        claims_dict = jwt.decode(  # type: ignore
            token, settings.auth_signing_secret, algorithms=[JWT_SIGN_ALGORITHM], options=JWT_DECODE_OPTIONS
        )
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return JWTClaims.model_validate(claims_dict)


def auth(token: Annotated[str, Depends(oauth2_scheme)]) -> AuthContext:
    """Dependency resolver for authentication.

    Note that this is not "secure", since this is just a demo app.
    The user simply needs to pass `Authorization: Bearer <user_id>`
    to authorize as the user with that ID. In a real application,
    you probably want to do proper auth and get the user ID from the
    token.
    """
    unauthorized = HTTPException(status_code=401)

    claims = decode_token(token)

    user = db.get_user(claims.sub)
    if user is None:
        raise unauthorized

    return AuthContext(employee=user)


AuthDependency = Annotated[AuthContext, Depends(auth)]


@app.post("/auth/token", response_model=out.OAuthLoginResponse)
async def oauth_token_endpoint(
    form_data: Annotated[OAuth2PasswordRequestFormStrict, Depends()],
) -> out.OAuthLoginResponse:
    """Return a JWT bearer token if the user is found."""
    user = db.get_user_by_email_and_password(form_data.username, form_data.password)
    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    claims = JWTClaims.from_user_id(
        user_id=user.id,
        expiration_seconds=JWT_EXPIRE_SECONDS,
    )
    token = jwt.encode(  # type: ignore
        payload=claims.model_dump(), key=settings.auth_signing_secret, algorithm=JWT_SIGN_ALGORITHM, sort_headers=True
    )

    return out.OAuthLoginResponse(
        access_token=token,
        expires_in=JWT_EXPIRE_SECONDS,
    )


@app.get("/users/me", response_model=out.User)
async def get_me(auth: AuthDependency) -> StoreEmployee:
    """Show the current user."""
    return auth.employee


# TODO: validate dates. This regex accepts 2000-90-90
DatePathParam = Annotated[str | None, Query(regex="^[0-9]{4}-[0-9]{2}-[0-9]{2}$")]


@app.get("/metrics/daily-orders")
async def get_orders(
    auth: AuthDependency,
    start: DatePathParam = None,
    end: DatePathParam = None,
) -> out.MetricOutput[dt.date, float]:
    """Get a buffer with daily orders for the current shop."""
    metric = "order_total"
    group_by = "metric_time__day"

    # NOTE: do SQL sanitization
    where = [f"{{{{ Dimension('location__location_name') }}}} = '{auth.employee.store_location_name}'"]

    if start is not None:
        where.append(f"{{{{ TimeDimension('metric_time', 'day') }}}} >= '{start}'")

    if end is not None:
        where.append(f"{{{{ TimeDimension('metric_time', 'day') }}}} <= '{end}'")

    query_task = sl.query(
        metrics=[metric],
        group_by=[group_by],
        where=where,
        order_by=[group_by],
    )
    sql_task = sl.compile_sql(
        metrics=[metric],
        group_by=[group_by],
        where=where,
        # TODO: fix SDK bug with order_by
        # order_by=[group_by],
    )

    table, sql = await asyncio.gather(query_task, sql_task)

    # cast table from datetime to date
    # TODO: have to use type ignores here because pyarrow-stubs isn't typed correctly and pyright doesn't like it
    # See: https://github.com/zen-xu/pyarrow-stubs/issues
    schema = pa.schema(  # type: ignore
        [
            pa.field(group_by.upper(), pa.date32()),  # type: ignore
            pa.field(metric.upper(), pa.float64()),  # type: ignore
        ]
    )
    table = table.cast(schema)

    out_data = out.MetricsGroupedBy[dt.date, float].from_arrow(group_by, [metric], table)

    return out.MetricOutput[dt.date, float](
        id="daily-orders",
        title=f"Daily orders in {auth.employee.store_location_name}",
        sql=sql,
        sl_query=out.SemanticLayerQuery(
            metrics=[metric],
            group_by=[group_by],
            where=where,
            order_by=[group_by],
        ),
        data=out_data,
    )
