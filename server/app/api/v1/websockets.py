from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(prefix="/ws", tags=["websockets"])


@router.websocket("/game/{game_id}")
async def websocket_endpoint(websocket: WebSocket, game_id: str) -> None:
    """WebSocket endpoint for real-time game play and chat (placeholder)."""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(
                f"Game {game_id} - Received: {data}"
            )
    except WebSocketDisconnect:
        pass
