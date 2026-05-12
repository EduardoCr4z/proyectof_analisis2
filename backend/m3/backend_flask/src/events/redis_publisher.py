import os

import redis
from src.config.mongodb import mongo


r = redis.Redis(host=os.getenv('REDIS_HOST', 'redis'), port=int(os.getenv('REDIS_PORT', '6379')))


def publish(stream, data):
    payload = {key: '' if value is None else str(value) for key, value in data.items()}
    try:
        return publish_direct(stream, payload)
    except Exception as e:
        mongo.db.outbox.insert_one({
            'stream': stream,
            'payload': payload,
            'status': 'PENDING'
        })
        print(f"[redis-stream] Redis no disponible. Guardando outbox stream={stream} error={e}", flush=True)
        return None


def publish_direct(stream, data):
    payload = {key: '' if value is None else str(value) for key, value in data.items()}
    event_id = r.xadd(stream, payload)
    print(f"[redis-stream] XADD stream={stream} id={event_id.decode('utf-8')} payload={payload}", flush=True)
    return event_id
