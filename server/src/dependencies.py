from typing import Annotated

from dbtsl.asyncio import AsyncSemanticLayerClient
from fastapi import Depends, Request


def get_sl_client(request: Request) -> AsyncSemanticLayerClient:
    """Expose app.state.sl as a nice dependency."""
    return request.app.state.sl


SemanticLayerDependency = Annotated[AsyncSemanticLayerClient, Depends(get_sl_client)]
