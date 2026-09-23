import redis.asyncio as redis
import json
import logging
from typing import Any, Optional
from core.config import settings

logger = logging.getLogger(__name__)

class RedisClient:
    def __init__(self):
        self.redis_url = settings.REDIS_URL
        self.client: Optional[redis.Redis] = None

    async def connect(self):
        try:
            self.client = redis.from_url(self.redis_url, decode_responses=True)
            await self.client.ping()
            logger.info(f"Connected to Redis at {self.redis_url}")
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")

    async def close(self):
        if self.client:
            await self.client.close()

    async def set_data(self, key: str, value: dict, ttl: int = 60):
        if self.client:
            await self.client.set(key, json.dumps(value), ex=ttl)

    async def get_data(self, key: str) -> Optional[dict]:
        if self.client:
            data = await self.client.get(key)
            if data:
                return json.loads(data)
        return None
    
    async def publish(self, channel: str, message: dict):
        if self.client:
            await self.client.publish(channel, json.dumps(message))

redis_client = RedisClient()
