from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestFormStrict

from src.auth.models import JWTClaims
from src.auth.models_out import OAuthLoginResponse
from src.db import db
from src.settings import settings

router = APIRouter(
    prefix="/auth",
)


@router.post("/token", response_model=OAuthLoginResponse)
async def oauth_token_endpoint(
    form_data: Annotated[OAuth2PasswordRequestFormStrict, Depends()],
) -> OAuthLoginResponse:
    """Return a JWT bearer token if the user is found."""
    user = db.get_user_by_email_and_password(form_data.username, form_data.password)
    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    claims = JWTClaims.from_user_id(
        user_id=user.id,
        expiration_seconds=settings.auth.jwt_expire_sec,
    )
    token = jwt.encode(  # type: ignore
        payload=claims.model_dump(),
        key=settings.auth.jwt_signing_secret,
        algorithm=settings.auth.jwt_algorithm,
        sort_headers=True,
    )

    return OAuthLoginResponse(
        access_token=token,
        expires_in=settings.auth.jwt_expire_sec,
    )
