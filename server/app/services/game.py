import os
import asyncio
from datetime import datetime
from typing import Optional, Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.game import Game, Move
from app.models.user import User
from app.core.database import SessionLocal


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
    query = select(Game).options(
        selectinload(Game.moves),
        selectinload(Game.player_white),
        selectinload(Game.player_black),
    )
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
        .options(
            selectinload(Game.moves),
            selectinload(Game.player_white),
            selectinload(Game.player_black),
        )
        .execution_options(populate_existing=True)
    )
    game = result.scalar_one_or_none()
    if game:
        game.board_state = reconstruct_board_state(game)
    return game


async def get_or_create_ai_user(db: AsyncSession) -> User:
    """Find the system AI user, or register it if not exists."""
    result = await db.execute(select(User).where(User.username == "AI"))
    ai_user = result.scalar_one_or_none()
    if not ai_user:
        from app.core.security import hash_password

        hashed = hash_password("ai_bot_dummy_password")
        ai_user = User(username="AI", hashed_password=hashed)
        db.add(ai_user)
        await db.flush()
        await db.commit()
    return ai_user


async def create_game(
    db: AsyncSession,
    creator_id: int,
    grid_size: int = 8,
    vs_ai: bool = False,
    ai_depth: int = 3,
) -> Game:
    """Create a new game in PENDING status (or ACTIVE if vs_ai) with creator as White player."""
    if grid_size < 4 or grid_size > 26:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Grid size must be between 4 and 26.",
        )
    if ai_depth < 1 or ai_depth > 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="AI depth must be between 1 and 6.",
        )
    if vs_ai:
        ai_user = await get_or_create_ai_user(db)
        game = Game(
            player_white_id=creator_id,
            player_black_id=ai_user.id,
            grid_size=grid_size,
            status="ACTIVE",
            current_turn="WHITE",
            ai_depth=ai_depth,
        )
    else:
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
    # Reload game to populate all relationships (e.g. player_white/black) and board state
    db_game = await get_game(db, game.id)
    if not db_game:
        game.board_state = BreakthroughBoard(grid_size=grid_size).board
        return game
    return db_game


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
    # Reload game to populate all relationships (e.g. player_white/black) and board state
    db_game = await get_game(db, game_id)
    if not db_game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found after join.",
        )
    return db_game


async def make_move_internal(
    db: AsyncSession, game: Game, user_id: int, from_cell: str, to_cell: str
) -> Game:
    """Internal helper to execute a move, update game turn, check for winner, and commit."""
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

    # --- MMR update logic (run after move, before commit) ---
    async def _calculate_mmr_delta(winner_mmr: int, loser_mmr: int) -> int:
        """Return point exchange based on the custom rule:
        * Equal MMR → ±10 points
        * Higher rated wins → smaller gain (ratio based)
        * Lower rated wins → larger gain (clamped to 40)
        """
        if winner_mmr >= loser_mmr:
            # higher or equal rating wins
            delta = int(10 * (loser_mmr / winner_mmr))
            return max(2, delta)  # at least 2 points exchange
        else:
            # lower rating wins – larger swing
            delta = int(10 * (winner_mmr / loser_mmr))
            return min(40, max(10, delta))

    # Apply MMR changes if the game has concluded
    if winner:
        # Determine winner and loser users
        winner_user_id = user_id
        loser_user_id = game.player_black_id if user_id == game.player_white_id else game.player_white_id
        # Load both users
        winner_res = await db.execute(select(User).where(User.id == winner_user_id))
        loser_res = await db.execute(select(User).where(User.id == loser_user_id))
        winner_user = winner_res.scalar_one_or_none()
        loser_user = loser_res.scalar_one_or_none()
        if winner_user and loser_user:
            delta = await _calculate_mmr_delta(winner_user.mmr, loser_user.mmr)
            winner_user.mmr += delta
            loser_user.mmr = max(0, loser_user.mmr - delta)
            db.add_all([winner_user, loser_user])
        game.status = "FINISHED"
        game.winner_id = user_id
    else:
        game.current_turn = "BLACK" if game.current_turn == "WHITE" else "WHITE"

    game.updated_at = datetime.now()
    await db.flush()
    await db.commit()

    db_game = await get_game(db, game.id)
    if not db_game:
        game.board_state = board.board
        return game
    return db_game


async def make_move(
    db: AsyncSession, game_id: int, user_id: int, from_cell: str, to_cell: str
) -> Game:
    """Execute a move, update game turn, check for winner, commit, and trigger AI if opponent is AI."""
    game = await get_game(db, game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found.",
        )

    # coup humain
    game = await make_move_internal(db, game, user_id, from_cell, to_cell)

    if game.status == "ACTIVE":
        next_player_id = (
            game.player_black_id
            if game.current_turn == "BLACK"
            else game.player_white_id
        )
        if next_player_id:
            ai_user = await get_or_create_ai_user(db)
            if next_player_id == ai_user.id:
                asyncio.create_task(trigger_ai_move_background(game.id))

    return game


def get_proutfish_path() -> str:
    """Find the path to the proutfish binary."""
    if os.path.exists("/ai_bot/proutfish"):
        return "/ai_bot/proutfish"
    local_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "ai_bot", "proutfish")
    )
    if os.path.exists(local_path):
        return local_path
    return "ai_bot/proutfish"


async def run_ai_bot(board_str: str, player_num: str, depth_str: str) -> str:
    """Run the AI bot asynchronously using a non-blocking subprocess."""
    proutfish_path = get_proutfish_path()
    proc = await asyncio.create_subprocess_exec(
        proutfish_path,
        board_str,
        player_num,
        depth_str,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise RuntimeError(
            f"AI bot failed with exit code {proc.returncode}: {stderr.decode()}"
        )
    return stdout.decode()


async def execute_ai_move(db: AsyncSession, game: Game, ai_user: User) -> Game:
    """Evaluate board state, invoke the C++ AI bot, parse its move, and play it."""
    board_state = reconstruct_board_state(game)
    board_str = ""
    for r in range(game.grid_size):
        for c in range(game.grid_size):
            cell = board_state[r][c]
            if cell is None:
                board_str += "0"
            elif cell == "WHITE":
                board_str += "1"
            elif cell == "BLACK":
                board_str += "2"
        board_str += ";"

    ai_color = "BLACK" if game.player_black_id == ai_user.id else "WHITE"
    player_num = "2" if ai_color == "BLACK" else "1"
    depth_str = str(game.ai_depth)

    try:
        stdout = await run_ai_bot(board_str, player_num, depth_str)
        move_str = stdout.strip()
        if not move_str:
            raise ValueError("AI bot returned empty output")

        parts = [p for p in move_str.split(";") if p]
        if len(parts) < 2:
            raise ValueError(f"AI bot returned invalid move format: {move_str}")

        from_cpp = parts[0]
        to_cpp = parts[1]

        from_row = ord(from_cpp[0].upper()) - ord("A")
        from_col = int(from_cpp[1:]) - 1

        to_row = ord(to_cpp[0].upper()) - ord("A")
        to_col = int(to_cpp[1:]) - 1

        board = BreakthroughBoard(grid_size=game.grid_size)
        from_cell = board.coords_to_cell(from_row, from_col)
        to_cell = board.coords_to_cell(to_row, to_col)

        game = await make_move_internal(
            db,
            game=game,
            user_id=ai_user.id,
            from_cell=from_cell,
            to_cell=to_cell,
        )
    except Exception as e:
        print(f"AI Bot error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI opponent failed to compute move: {str(e)}",
        )

    return game


async def trigger_ai_move_background(game_id: int) -> None:
    """Background task to load the game, execute AI move, and broadcast the update."""
    await asyncio.sleep(0.5)

    async with SessionLocal() as db:
        game = await get_game(db, game_id)
        if not game or game.status != "ACTIVE":
            return

        next_player_id = (
            game.player_black_id
            if game.current_turn == "BLACK"
            else game.player_white_id
        )
        if not next_player_id:
            return

        ai_user = await get_or_create_ai_user(db)
        if next_player_id != ai_user.id:
            return

        game = await execute_ai_move(db, game, ai_user)

        from app.schemas.game import GameResponse
        from app.services.connection_manager import manager

        try:
            serialized = GameResponse.model_validate(game).model_dump(mode="json")
        except AttributeError:
            serialized = GameResponse.from_orm(game).dict()

        await manager.broadcast_to_game(
            game_id=game.id,
            message={
                "type": "game_update",
                "event": "move_played",
                "game": serialized,
            },
        )
