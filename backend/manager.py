from fastapi import WebSocket
from typing import Dict, List
import random

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, match_id: str):
        await websocket.accept()
        if match_id not in self.active_connections:
            self.active_connections[match_id] = []
        
        if len(self.active_connections[match_id]) < 2:
            # Assign color to player
            colors = ["white", "black"]
            assigned_colors = [conn.extra['color'] for conn in self.active_connections[match_id]]
            available_colors = list(set(colors) - set(assigned_colors))
            color = random.choice(available_colors)
            websocket.extra = {'color': color}

            await websocket.send_text(f"color:{color}")
            self.active_connections[match_id].append(websocket)

    def disconnect(self, websocket: WebSocket, match_id: str):
        self.active_connections[match_id].remove(websocket)
        if not self.active_connections[match_id]:
            del self.active_connections[match_id]

    async def broadcast(self, message: str, match_id: str):
        for connection in self.active_connections.get(match_id, []):
            await connection.send_text(message)