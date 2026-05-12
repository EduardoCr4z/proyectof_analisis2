import time

import redis
from src.config.mongodb import mongo


r = redis.Redis(host='redis', port=6379)
STREAM = 'estudiante-stream'
GROUP = 'm3-estudiante-group'
CONSUMER = 'consumer-1'

def estudiante_consumer(app):
    with app.app_context():
        while True:
            try:
                r.xgroup_create(STREAM, GROUP, id='0', mkstream=True)
                print(f"[redis-stream] Grupo creado: {GROUP}", flush=True)
                break
            except redis.exceptions.ResponseError as e:
                if "BUSYGROUP" in str(e):
                    print(f"[redis-stream] Grupo ya existe: {GROUP}", flush=True)
                    break
                raise
            except redis.exceptions.RedisError as e:
                print(f"[redis-stream] Redis no disponible creando grupo {STREAM}. Reintentando... {e}", flush=True)
                time.sleep(5)
        
        print(f"[redis-stream] Escuchando stream={STREAM} group={GROUP} consumer={CONSUMER}")

        def has_messages(response):
            return any(messages for _, messages in response or [])

        while True:
            try:
                response = r.xreadgroup(GROUP, CONSUMER, {STREAM: '0'}, count=10)
                if not has_messages(response):
                    response = r.xreadgroup(GROUP, CONSUMER, {STREAM: '>'}, count=10, block=5000)
                
                if has_messages(response):
                    for stream, messages in response:
                        for msg_id, data in messages:
                            evento = {}
                            for k, v in data.items():
                                key = k.decode('utf-8')
                                value = v.decode('utf-8')
                                evento [key] = value
                            
                            print(f"[redis-stream] Evento recibido id={msg_id.decode('utf-8')}", evento)
                            if evento['event'] == 'estudiante_created':
                                
                                estudiante = {
                                    'idEstudiante': int(evento['idEstudiante']),
                                    'nombre': evento['nombre'],
                                    'correo': evento['correo'],
                                    'telefono': evento['telefono'],
                                    'usuario': evento['usuario'],
                                    'pass': evento['pass']
                                }
                                
                                
                                result = mongo.db.estudiante.update_one(
                                    {'idEstudiante': estudiante['idEstudiante']},
                                    {'$set': estudiante},
                                    upsert=True
                                )

                                print(
                                    "Estudiante creado/actualizado en Mongo",
                                    {
                                        "matched": result.matched_count,
                                        "modified": result.modified_count,
                                        "upserted_id": str(result.upserted_id) if result.upserted_id else None
                                    }
                                )
                            elif evento['event'] == 'estudiante_updated':
                                result = mongo.db.estudiante.update_one(
                                    {'idEstudiante': int(evento['idEstudiante'])},
                                    {
                                        '$set': {
                                            'nombre': evento['nombre'],
                                            'correo': evento['correo'],
                                            'telefono': evento['telefono'],
                                            'usuario': evento['usuario'],
                                            'pass': evento['pass']
                                            
                                        }
                                    },
                                    upsert=True
                                )
                                print(
                                    "Estudiante actualizado en Mongo",
                                    {
                                        "matched": result.matched_count,
                                        "modified": result.modified_count,
                                        "upserted_id": str(result.upserted_id) if result.upserted_id else None
                                    }
                                )
                            elif evento['event'] == 'estudiante_deleted':
                                result = mongo.db.estudiante.delete_one(
                                    {'idEstudiante': int(evento['idEstudiante'])}
                                )
                                print("Estudiante eliminado en Mongo", {"deleted": result.deleted_count})
                            r.xack(STREAM, GROUP, msg_id)
                            print(f"[redis-stream] ACK stream={STREAM} group={GROUP} id={msg_id.decode('utf-8')}")
            except redis.exceptions.RedisError as e:
                print("[redis-stream] Error leyendo stream:", e)
                time.sleep(5)
