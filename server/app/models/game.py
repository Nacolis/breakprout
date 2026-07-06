from datetime import datetime
from typing import Optional
from sqlalchemy import ForeignKey, Integer, String, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.models.base import Base


class Game(Base):
    """Game database model storing the current state of a Breakthrough game."""

    __tablename__ = "games"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    player_white_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )
    player_black_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )
    current_turn: Mapped[str] = mapped_column(
        String, nullable=False, default="WHITE"
    )  # "WHITE" or "BLACK"
    status: Mapped[str] = mapped_column(
        String, nullable=False, default="PENDING"
    )  # "PENDING", "ACTIVE", "FINISHED"
    winner_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )
    grid_size: Mapped[int] = mapped_column(Integer, nullable=False, default=8)
    ai_depth: Mapped[int] = mapped_column(Integer, nullable=False, default=3)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=func.now(), onupdate=func.now()
    )

    # Relationships
    player_white = relationship("User", foreign_keys=[player_white_id])
    player_black = relationship("User", foreign_keys=[player_black_id])
    winner = relationship("User", foreign_keys=[winner_id])
    moves: Mapped[list["Move"]] = relationship(
        "Move",
        back_populates="game",
        cascade="all, delete-orphan",
        order_by="Move.move_number",
    )


class Move(Base):
    """Move database model storing each played move to reconstruct history."""

    __tablename__ = "moves"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    game_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("games.id", ondelete="CASCADE"), nullable=False
    )
    move_number: Mapped[int] = mapped_column(Integer, nullable=False)
    player_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    from_cell: Mapped[str] = mapped_column(String, nullable=False)  # e.g., "E2"
    to_cell: Mapped[str] = mapped_column(String, nullable=False)  # e.g., "E3"
    played_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=func.now()
    )

    # Relationships
    game: Mapped["Game"] = relationship("Game", back_populates="moves")
    player = relationship("User")

    __table_args__ = (
        UniqueConstraint("game_id", "move_number", name="uq_game_move_number"),
    )
