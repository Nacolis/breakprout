import asyncio
import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select

from app.api.v1 import api_router
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.game import Game
from app.services.connection_manager import manager


async def cleanup_inactive_games() -> None:
    while True:
        try:
            await asyncio.sleep(60)
            async with SessionLocal() as db:
                cutoff = datetime.utcnow() - timedelta(minutes=10)
                result = await db.execute(
                    select(Game).where(
                        (Game.status != "FINISHED") & (Game.updated_at < cutoff)
                    )
                )
                inactive_games = result.scalars().all()
                for game in inactive_games:
                    await manager.broadcast_to_game(
                        game_id=game.id,
                        message={
                            "type": "error",
                            "message": "Game terminated due to inactivity.",
                        },
                    )
                    await db.delete(game)
                if inactive_games:
                    await db.commit()
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Error cleaning up inactive games: {e}", flush=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("static/avatars", exist_ok=True)
    cleanup_task = asyncio.create_task(cleanup_inactive_games())
    yield
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static folder
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")



@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    """Health check endpoint to verify server is active and configuration is loaded."""
    return {"status": "ok", "project": settings.PROJECT_NAME}


# Include all v1 API and WebSocket routes
app.include_router(api_router, prefix=settings.API_V1_STR)