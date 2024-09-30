from typing import Annotated

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from src.auth.models import AuthContext, JWTClaims
from src.db import db
from src.settings import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
JWT_DECODE_OPTIONS = {"require": ["exp", "iat", "sub"]}


def decode_token(token: str) -> JWTClaims:
    """Decode a JWT token, raise 401 if token is invalid."""
    try:
        claims_dict = jwt.decode(  # type: ignore
            token,
            settings.auth.jwt_signing_secret,
            algorithms=[settings.auth.jwt_algorithm],
            options=JWT_DECODE_OPTIONS,
        )
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return JWTClaims.model_validate(claims_dict)


def auth(token: Annotated[str, Depends(oauth2_scheme)]) -> AuthContext:
    """Dependency resolver for authentication which parses the JWT."""
    unauthorized = HTTPException(status_code=401)

    claims = decode_token(token)

    user = db.get_user(claims.sub)
    if user is None:
        raise unauthorized

    return AuthContext(user=user)


AuthDependency = Annotated[AuthContext, Depends(auth)]
