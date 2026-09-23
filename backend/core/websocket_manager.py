import asyncio
import json
import logging
from fastapi import WebSocket, WebSocketDisconnect
from typing import List

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket Client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket Client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        # Broadcast standard payload to all active clients
        payload = json.dumps(message)
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")
                dead_connections.append(connection)
        
        for dead in dead_connections:
            self.disconnect(dead)

    async def heartbeat_loop(self):
        # 25-second interval heartbeat to prevent tunnel idle timeouts
        while True:
            await asyncio.sleep(25)
            await self.broadcast({"type": "heartbeat", "status": "ok"})

manager = ConnectionManager()
