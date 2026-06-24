from datetime import datetime
from typing import Optional, Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql import func
from fastapi import HTTPException, status
from app.models.game import Game, Move


class BreakthroughBoard:
    """Breakthrough game rules engine and board state simulator."""

    def __init__(self, grid_size: int = 8):
        self.grid_size = grid_size
        self.board: list[list[Optional[str]]] = [
            [None for _ in range(grid_size)] for _ in range(grid_size)
        ]
        self.initialize_board()

    def initialize_board(self) -> None:
        """Set up starting pieces: rows 1-2 for White, rows N-1 to N for Black."""
        for r in range(2):
            for c in range(self.grid_size):
                self.board[r][c] = "WHITE"
        for r in range(self.grid_size - 2, self.grid_size):
            for c in range(self.grid_size):
                self.board[r][c] = "BLACK"

    def cell_to_coords(self, cell: str) -> tuple[int, int]:
        """Convert standard notation like 'E2' to (row_idx, col_idx).

        Col: 'A' -> 0, 'B' -> 1, ...
        Row: '1' -> 0, '2' -> 1, ...
        """
        cell = cell.upper().strip()
        if not cell or len(cell) < 2:
            raise ValueError(f"Invalid cell format: '{cell}'")
        col_char = cell[0]
        row_str = cell[1:]

        c = ord(col_char) - ord("A")
        try:
            r = int(row_str) - 1
        except ValueError:
            raise ValueError(f"Invalid row number in cell: '{cell}'")

        if not (0 <= c < self.grid_size) or not (0 <= r < self.grid_size):
            raise ValueError(
                f"Cell out of bounds: '{cell}' for grid size {self.grid_size}"
            )
        return r, c

    def coords_to_cell(self, r: int, c: int) -> str:
        """Convert (row_idx, col_idx) to standard notation like 'E2'."""
        col_char = chr(ord("A") + c)
        row_str = str(r + 1)
        return f"{col_char}{row_str}"

    def is_valid_move(self, player_color: str, from_cell: str, to_cell: str) -> bool:
        """Verify if a move is valid under Breakthrough rules."""
        try:
            from_r, from_c = self.cell_to_coords(from_cell)
            to_r, to_c = self.cell_to_coords(to_cell)
        except ValueError:
            return False

        if self.board[from_r][from_c] != player_color:
            return False

        row_diff = to_r - from_r
        col_diff = to_c - from_c

        expected_row_diff = 1 if player_color == "WHITE" else -1
        if row_diff != expected_row_diff:
            return False

        if col_diff == 0:
            return self.board[to_r][to_c] is None

        elif abs(col_diff) == 1:
            target = self.board[to_r][to_c]
            return target is None or target != player_color

        return False

    def make_move(self, player_color: str, from_cell: str, to_cell: str) -> bool:
        """Apply a move to the board if valid, returning whether application succeeded."""
        if not self.is_valid_move(player_color, from_cell, to_cell):
            return False
        from_r, from_c = self.cell_to_coords(from_cell)
        to_r, to_c = self.cell_to_coords(to_cell)

        self.board[to_r][to_c] = player_color
        self.board[from_r][from_c] = None
        return True

    def check_winner(self) -> Optional[str]:
        """Check if there is a winner.

        Returns "WHITE" or "BLACK" if a player won, else None.
        """
        for c in range(self.grid_size):
            if self.board[self.grid_size - 1][c] == "WHITE":
                return "WHITE"
        for c in range(self.grid_size):
            if self.board[0][c] == "BLACK":
                return "BLACK"

        white_pieces = sum(row.count("WHITE") for row in self.board)
        black_pieces = sum(row.count("BLACK") for row in self.board)

        if white_pieces == 0:
            return "BLACK"
        if black_pieces == 0:
            return "WHITE"

        return None


def reconstruct_board_state(game: Game) -> list[list[Optional[str]]]:
    """Reconstruct board state by replaying moves in order."""
    board = BreakthroughBoard(grid_size=game.grid_size)
    for move in game.moves:
        player_color = "WHITE" if move.player_id == game.player_white_id else "BLACK"
        board.make_move(player_color, move.from_cell, move.to_cell)
    return board.board


async def list_games(
    db: AsyncSession, status_filter: Optional[str] = None
) -> Sequence[Game]:
    """Retrieve all games with optional status filter."""
    query = select(Game).options(selectinload(Game.moves))
    if status_filter:
        query = query.where(Game.status == status_filter)
    result = await db.execute(query)
    games = result.scalars().all()
    for g in games:
        g.board_state = reconstruct_board_state(g)
    return games


async def get_game(db: AsyncSession, game_id: int) -> Optional[Game]:
    """Retrieve a game by ID, reconstructing its board state."""
    result = await db.execute(
        select(Game)
        .where(Game.id == game_id)
        .options(selectinload(Game.moves))
        .execution_options(populate_existing=True)
    )
    game = result.scalar_one_or_none()
    if game:
        game.board_state = reconstruct_board_state(game)
    return game


async def create_game(db: AsyncSession, creator_id: int, grid_size: int = 8) -> Game:
    """Create a new game in PENDING status with creator as White player."""
    if grid_size < 4 or grid_size > 26:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Grid size must be between 4 and 26.",
        )
    game = Game(
        player_white_id=creator_id,
        grid_size=grid_size,
        status="PENDING",
        current_turn="WHITE",
    )
    game.moves = []
    db.add(game)
    await db.flush()
    await db.commit()
    game.board_state = BreakthroughBoard(grid_size=grid_size).board
    return game


async def join_game(db: AsyncSession, game_id: int, user_id: int) -> Game:
    """Join a PENDING game as the Black player and mark it ACTIVE."""
    game = await get_game(db, game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found.",
        )
    if game.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Game is not in PENDING status.",
        )
    if game.player_white_id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot join your own game as the opponent.",
        )

    game.player_black_id = user_id
    game.status = "ACTIVE"
    game.updated_at = datetime.now()
    await db.flush()
    await db.commit()
    game.board_state = reconstruct_board_state(game)
    return game


async def make_move(
    db: AsyncSession, game_id: int, user_id: int, from_cell: str, to_cell: str
) -> Game:
    """Execute a move, update game turn, check for winner, and commit."""
    game = await get_game(db, game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found.",
        )
    if game.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Game is not ACTIVE.",
        )

    # Vérifie si c'est au tour du joueur
    if game.current_turn == "WHITE" and game.player_white_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="It is not your turn (Waiting for WHITE).",
        )
    elif game.current_turn == "BLACK" and game.player_black_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="It is not your turn (Waiting for BLACK).",
        )

    player_color = "WHITE" if user_id == game.player_white_id else "BLACK"

    board = BreakthroughBoard(grid_size=game.grid_size)
    for move in game.moves:
        m_color = "WHITE" if move.player_id == game.player_white_id else "BLACK"
        board.make_move(m_color, move.from_cell, move.to_cell)

    if not board.is_valid_move(player_color, from_cell, to_cell):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid move from '{from_cell}' to '{to_cell}'.",
        )

    move = Move(
        game_id=game.id,
        move_number=len(game.moves) + 1,
        player_id=user_id,
        from_cell=from_cell,
        to_cell=to_cell,
    )
    game.moves.append(move)
    await db.flush()

    board.make_move(player_color, from_cell, to_cell)
    winner = board.check_winner()

    if winner:
        game.status = "FINISHED"
        game.winner_id = user_id
    else:
        game.current_turn = "BLACK" if game.current_turn == "WHITE" else "WHITE"

    game.updated_at = datetime.now()
    await db.flush()
    await db.commit()

    game.board_state = board.board
    return game
