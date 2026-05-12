import time

import redis
from src.config.mongodb import mongo


r = redis.Redis(host='redis', port=6379)
STREAM = 'admin-stream'
GROUP = 'm3-admin-group'
CONSUMER = 'consumer-1'


def admin_consumer(app):
    with app.app_context():
        create_group()
        print(f"[redis-stream] Escuchando stream={STREAM} group={GROUP} consumer={CONSUMER}", flush=True)

        while True:
            try:
                response = r.xreadgroup(GROUP, CONSUMER, {STREAM: '0'}, count=10)
                if not has_messages(response):
                    response = r.xreadgroup(GROUP, CONSUMER, {STREAM: '>'}, count=10, block=5000)

                if has_messages(response):
                    for _, messages in response:
                        for msg_id, data in messages:
                            evento = decode(data)
                            print(f"[redis-stream] Evento recibido id={msg_id.decode('utf-8')}", evento, flush=True)
                            process_event(evento)
                            r.xack(STREAM, GROUP, msg_id)
                            print(f"[redis-stream] ACK stream={STREAM} group={GROUP} id={msg_id.decode('utf-8')}", flush=True)
            except redis.exceptions.RedisError as e:
                print("[redis-stream] Error leyendo stream:", e, flush=True)
                time.sleep(5)


def create_group():
    while True:
        try:
            r.xgroup_create(STREAM, GROUP, id='0', mkstream=True)
            print(f"[redis-stream] Grupo creado: {GROUP}", flush=True)
            return
        except redis.exceptions.ResponseError as e:
            if "BUSYGROUP" in str(e):
                print(f"[redis-stream] Grupo ya existe: {GROUP}", flush=True)
                return
            raise
        except redis.exceptions.RedisError as e:
            print(f"[redis-stream] Redis no disponible creando grupo {STREAM}. Reintentando... {e}", flush=True)
            time.sleep(5)


def has_messages(response):
    return any(messages for _, messages in response or [])


def decode(data):
    return {key.decode('utf-8'): value.decode('utf-8') for key, value in data.items()}


def process_event(evento):
    if evento['event'] == 'admin_created':
        mongo.db.admin.update_one(
            {'idAdmin': int(evento['idAdmin'])},
            {'$set': admin_document(evento)},
            upsert=True
        )
    elif evento['event'] == 'admin_updated':
        mongo.db.admin.update_one(
            {'idAdmin': int(evento['idAdmin'])},
            {'$set': admin_document(evento)},
            upsert=True
        )
    elif evento['event'] == 'admin_deleted':
        mongo.db.admin.delete_one({'idAdmin': int(evento['idAdmin'])})


def admin_document(evento):
    return {
        'idAdmin': int(evento['idAdmin']),
        'nombre': evento.get('nombre', ''),
        'correo': evento.get('correo', ''),
        'telefono': evento.get('telefono', ''),
        'usuario': evento.get('usuario', ''),
        'pass': evento.get('pass', '')
    }
