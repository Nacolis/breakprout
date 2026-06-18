from fastapi import WebSocket


class ConnectionManager:
    """Connection manager for tracking active WebSockets per game."""

    def __init__(self) -> None:
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, game_id: int) -> None:
        """Accept WebSocket connection and subscribe it to a game's events."""
        await websocket.accept()
        if game_id not in self.active_connections:
            self.active_connections[game_id] = []
        self.active_connections[game_id].append(websocket)

    def disconnect(self, websocket: WebSocket, game_id: int) -> None:
        """Unsubscribe WebSocket connection from a game's events."""
        if game_id in self.active_connections:
            if websocket in self.active_connections[game_id]:
                self.active_connections[game_id].remove(websocket)
            if not self.active_connections[game_id]:
                del self.active_connections[game_id]

    async def send_personal_message(self, message: dict, websocket: WebSocket) -> None:
        """Send a JSON message to a single WebSocket client."""
        await websocket.send_json(message)

    async def broadcast_to_game(self, game_id: int, message: dict) -> None:
        """Broadcast a JSON message to all clients in a specific game."""
        if game_id in self.active_connections:
            for connection in self.active_connections[game_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass


manager = ConnectionManager()
