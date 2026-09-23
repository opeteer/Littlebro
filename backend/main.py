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
    
    # Start heartbeat loop & telemetry broadcast
    asyncio.create_task(manager.heartbeat_loop())
    asyncio.create_task(telemetry_broadcast_loop())
    
    yield
    # Shutdown
    logger.info("Shutting down Littlebro Backend...")
    await redis_client.close()
    scheduler.stop_scheduler()

app = FastAPI(
    title="Littlebro Geospatial Telemetry Platform",
    description="Our kiddo's playing with OSINT",
    lifespan=lifespan
)

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

from modules.conflict_live_aggregator import get_dynamic_conflict_geojson

async def telemetry_broadcast_loop():
    logger.info("Starting live telemetry WebSocket broadcast loop...")
    while True:
        await asyncio.sleep(10)
        try:
            conflict_geojson = await get_dynamic_conflict_geojson()
            await manager.broadcast({
                "type": "TELEMETRY_UPDATE",
                "module": "conflict",
                "data": conflict_geojson
            })
        except Exception as e:
            logger.error(f"Error broadcasting telemetry stream: {e}")

@app.get("/api/v1/telemetry/conflict")
async def get_conflict_heatmap():
    data = await get_dynamic_conflict_geojson()
    return data
