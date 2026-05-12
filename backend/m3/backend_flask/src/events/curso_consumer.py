import time

import redis
from src.config.mongodb import mongo


r = redis.Redis(host='redis', port=6379)
STREAM = 'curso-stream'
GROUP = 'm3-curso-group'
CONSUMER = 'consumer-1'

def curso_consumer(app):
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
                            if evento['event'] == 'curso_created':
                                
                                curso = {
                                    'idCurso': int(evento['idCurso']),
                                    'nombre': evento['nombre'],
                                    'idProfesor': int(evento['idProfesor'])
                                }
                                
                                
                                mongo.db.curso.insert_one(curso)
                                
                                print("Curso creado")
                            elif evento['event'] == 'curso_update':
                                mongo.db.curso.update_one(
                                    {'idCurso': int(evento['idCurso'])},
                                    {
                                        '$set': {
                                            'nombre': evento['nombre'],
                                            'idProfesor': int(evento['idProfesor'])
                                        }
                                    }
                                )
                                print("Curso actualizado")
                            elif evento['event'] == 'curso_delete':
                                mongo.db.curso.delete_one(
                                    {'idCurso': int(evento['idCurso'])}
                                )
                                print("Curso eliminado")
                            r.xack(STREAM, GROUP, msg_id)
                            print(f"[redis-stream] ACK stream={STREAM} group={GROUP} id={msg_id.decode('utf-8')}")
            except redis.exceptions.RedisError as e:
                print("[redis-stream] Error leyendo stream:", e)
                time.sleep(5)
                            
