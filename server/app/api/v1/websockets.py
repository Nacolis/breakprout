from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.services import game as game_service
from app.services.connection_manager import manager
from app.api.v1.games import serialize_game

router = APIRouter(prefix="/ws", tags=["websockets"])


@router.websocket("/game/{game_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    game_id: int,
    token: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
) -> None:
    """WebSocket endpoint for real-time game play and chat with JWT authentication."""
    # 1. Authenticate connection
    if not token:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION, reason="Missing token"
        )
        return

    payload = decode_access_token(token)
    if not payload:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token"
        )
        return

    user_id_str = payload.get("sub")
    if not user_id_str:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token subject"
        )
        return

    try:
        user_id = int(user_id_str)
    except ValueError:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION, reason="Invalid user ID format"
        )
        return

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION, reason="User not found"
        )
        return

    # 2. Check if game exists
    game = await game_service.get_game(db, game_id)
    if not game:
        await websocket.close(
            code=status.WS_1011_INTERNAL_ERROR, reason="Game not found"
        )
        return

    # 3. Accept and register connection
    await manager.connect(websocket, game.id)

    # SYNC le gars
    await manager.send_personal_message(
        {"type": "sync", "game": serialize_game(game)}, websocket
    )

    try:
        while True:
            # On attend un json
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "move":
                from_cell = data.get("from_cell")
                to_cell = data.get("to_cell")
                if not from_cell or not to_cell:
                    await manager.send_personal_message(
                        {
                            "type": "error",
                            "message": "Missing 'from_cell' or 'to_cell' for move",
                        },
                        websocket,
                    )
                    continue

                try:
                    updated_game = await game_service.make_move(
                        db,
                        game_id=game.id,
                        user_id=user.id,
                        from_cell=from_cell,
                        to_cell=to_cell,
                    )
                    # Broadcast state update to everyone
                    await manager.broadcast_to_game(
                        game_id=game.id,
                        message={
                            "type": "game_update",
                            "event": "move_played",
                            "game": serialize_game(updated_game),
                        },
                    )
                except Exception as e:
                    err_msg = getattr(e, "detail", str(e))
                    await manager.send_personal_message(
                        {"type": "error", "message": err_msg}, websocket
                    )

            elif msg_type == "chat":
                content = data.get("content")
                if content:
                    await manager.broadcast_to_game(
                        game_id=game.id,
                        message={
                            "type": "chat",
                            "username": user.username,
                            "content": content,
                        },
                    )

            else:
                await manager.send_personal_message(
                    {
                        "type": "error",
                        "message": f"Unsupported message type: {msg_type}",
                    },
                    websocket,
                )

    except WebSocketDisconnect:
        manager.disconnect(websocket, game.id)
