from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.game import GameCreate, GameResponse, MoveCreate
from app.services import game as game_service
from app.services.connection_manager import manager

router = APIRouter(prefix="/games", tags=["games"])


def serialize_game(game) -> dict:
    """Helper to serialize a Game database model using Pydantic GameResponse."""
    try:
        return GameResponse.model_validate(game).model_dump(mode="json")
    except AttributeError:
        return GameResponse.from_orm(game).dict()


@router.post("/", response_model=GameResponse, status_code=status.HTTP_201_CREATED)
async def create_new_game(
    game_in: GameCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GameResponse:
    """Create a new Breakthrough game."""
    game = await game_service.create_game(
        db, creator_id=current_user.id, grid_size=game_in.grid_size, vs_ai=game_in.vs_ai
    )
    return game


@router.post("/{game_id}/join", response_model=GameResponse)
async def join_existing_game(
    game_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GameResponse:
    """Join a pending game as the second player."""
    game = await game_service.join_game(db, game_id, current_user.id)
    await manager.broadcast_to_game(
        game_id=game.id,
        message={
            "type": "game_update",
            "event": "player_joined",
            "game": serialize_game(game),
        },
    )
    return game


@router.get("/", response_model=list[GameResponse])
async def list_games(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list:
    """List all games, optionally filtered by status."""
    games = await game_service.list_games(db, status_filter=status)
    return games


@router.get("/{game_id}", response_model=GameResponse)
async def get_game_details(
    game_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GameResponse:
    """Retrieve detailed game state including board state representation."""
    game = await game_service.get_game(db, game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found.",
        )
    return game


@router.post("/{game_id}/move", response_model=GameResponse)
async def play_move(
    game_id: int,
    move_in: MoveCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GameResponse:
    """Submit a move via REST API and broadcast the updated state to WebSocket clients."""
    game = await game_service.make_move(
        db,
        game_id=game_id,
        user_id=current_user.id,
        from_cell=move_in.from_cell,
        to_cell=move_in.to_cell,
    )
    await manager.broadcast_to_game(
        game_id=game.id,
        message={
            "type": "game_update",
            "event": "move_played",
            "game": serialize_game(game),
        },
    )
    return game
