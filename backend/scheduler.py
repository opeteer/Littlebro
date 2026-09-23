import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from core.redis_client import redis_client

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

async def dummy_job():
    logger.info("Executing telemetry dummy job")
    await redis_client.publish("telemetry_updates", {"module": "system", "status": "active"})

def start_scheduler():
    logger.info("Starting background scheduler...")
    # Add jobs here
    # scheduler.add_job(dummy_job, 'interval', seconds=60)
    scheduler.start()

def stop_scheduler():
    logger.info("Stopping background scheduler...")
    scheduler.shutdown()
