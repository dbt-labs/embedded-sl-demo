from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from dbtsl.asyncio import AsyncSemanticLayerClient
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.auth import AuthDependency
from src.auth import router as router_auth
from src.auth.models import User
from src.auth.models_out import User as UserOut
from src.metrics import router as router_metrics
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
        app.state.sl = sl
        yield
        app.state.sl = None


app = FastAPI(lifespan=lifespan)

app.include_router(router_auth)
app.include_router(router_metrics)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/users/me", response_model=UserOut)
async def get_me(auth: AuthDependency) -> User:
    """Show the current user."""
    return auth.user
