from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class MoveCreate(BaseModel):
    from_cell: str
    to_cell: str


class MoveResponse(BaseModel):
    id: int
    game_id: int
    move_number: int
    player_id: int
    from_cell: str
    to_cell: str
    played_at: datetime

    class Config:
        from_attributes = True


class GameCreate(BaseModel):
    grid_size: Optional[int] = 8
    vs_ai: Optional[bool] = False


class GameResponse(BaseModel):
    id: int
    player_white_id: Optional[int]
    player_black_id: Optional[int]
    current_turn: str
    status: str
    winner_id: Optional[int]
    grid_size: int
    created_at: datetime
    updated_at: datetime
    moves: list[MoveResponse]
    board_state: Optional[list[list[Optional[str]]]] = None

    class Config:
        from_attributes = True
