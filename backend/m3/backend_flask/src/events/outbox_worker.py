import time

from src.config.mongodb import mongo
from src.events.redis_publisher import publish_direct


def outbox_worker(app):
    with app.app_context():
        while True:
            try:
                eventos = list(mongo.db.outbox.find({'status': 'PENDING'}).sort('_id', 1).limit(50))

                for evento in eventos:
                    if not evento.get('stream') or not str(evento.get('stream')).endswith('-stream'):
                        mongo.db.outbox.update_one(
                            {'_id': evento['_id']},
                            {'$set': {'status': 'IGNORED'}}
                        )
                        continue

                    try:
                        publish_direct(evento['stream'], evento['payload'])
                        mongo.db.outbox.update_one(
                            {'_id': evento['_id']},
                            {'$set': {'status': 'SENT'}}
                        )
                        print(f"[outbox] Evento reenviado stream={evento['stream']} id={evento['_id']}", flush=True)
                    except Exception as e:
                        print(f"[outbox] Redis sigue no disponible. Reintento despues: {e}", flush=True)
                        break
            except Exception as e:
                print(f"[outbox] Error leyendo outbox: {e}", flush=True)

            time.sleep(5)
