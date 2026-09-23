import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.redis_client import redis_client
from core.websocket_manager import manager
import scheduler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Littlebro Backend...")
    await redis_client.connect()
    
    # Start background scheduler
    scheduler.start_scheduler()
    
    # Start heartbeat loop
    asyncio.create_task(manager.heartbeat_loop())
    
    yield
    # Shutdown
    logger.info("Shutting down Littlebro Backend...")
    await redis_client.close()
    scheduler.stop_scheduler()

app = FastAPI(title="Littlebro Geospatial Telemetry Platform", lifespan=lifespan)

# CORS Setup
origins = settings.FRONTEND_CORS_ORIGINS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Littlebro systems operational"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect much client->server data via WS, mostly just listening
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text('{"type": "pong"}')
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)
