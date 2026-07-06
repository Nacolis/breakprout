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
    resolved_token = token
    if not resolved_token or resolved_token.startswith("cookie_auth"):
        resolved_token = websocket.cookies.get("access_token")
    if not resolved_token:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION, reason="Missing token"
        )
        return


    payload = decode_access_token(resolved_token)


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


@router.websocket("/global")
async def websocket_global_endpoint(
    websocket: WebSocket,
    token: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
) -> None:
    from app.models.friendship import Friendship
    from app.services.online_manager import online_manager

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

    friends_res = await db.execute(
        select(Friendship.friend_id).where(Friendship.user_id == user.id)
    )
    friend_ids = [r for r in friends_res.scalars().all()]

    await online_manager.connect(user.id, websocket)

    for friend_id in friend_ids:
        if online_manager.is_online(friend_id):
            await online_manager.send_personal_message(
                {
                    "type": "status_update",
                    "user_id": user.id,
                    "username": user.username,
                    "status": "online",
                },
                friend_id,
            )

    friends_status = {}
    for friend_id in friend_ids:
        friends_status[str(friend_id)] = (
            "online" if online_manager.is_online(friend_id) else "offline"
        )

    await websocket.send_json(
        {
            "type": "sync_friends",
            "friends": friends_status,
        }
    )

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "private_message":
                to_user_id = data.get("to_user_id")
                content = data.get("content")

                if not to_user_id or not content:
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": "Missing 'to_user_id' or 'content' in message",
                        }
                    )
                    continue

                try:
                    to_user_id = int(to_user_id)
                except ValueError:
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": "Invalid 'to_user_id' format",
                        }
                    )
                    continue

                friendship_res = await db.execute(
                    select(Friendship).where(
                        (Friendship.user_id == user.id)
                        & (Friendship.friend_id == to_user_id)
                    )
                )
                if not friendship_res.scalar_one_or_none():
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": "You can only message your friends",
                        }
                    )
                    continue

                if not online_manager.is_online(to_user_id):
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": "User is offline",
                        }
                    )
                    continue

                await online_manager.send_personal_message(
                    {
                        "type": "private_message",
                        "from_user_id": user.id,
                        "from_username": user.username,
                        "content": content,
                    },
                    to_user_id,
                )

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

            else:
                await websocket.send_json(
                    {
                        "type": "error",
                        "message": f"Unsupported message type: {msg_type}",
                    }
                )

    except WebSocketDisconnect:
        is_offline = online_manager.disconnect(user.id, websocket)
        if is_offline:
            for friend_id in friend_ids:
                if online_manager.is_online(friend_id):
                    await online_manager.send_personal_message(
                        {
                            "type": "status_update",
                            "user_id": user.id,
                            "username": user.username,
                            "status": "offline",
                        },
                        friend_id,
                    )

