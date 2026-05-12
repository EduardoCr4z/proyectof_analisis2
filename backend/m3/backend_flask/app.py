from flask import Flask
from src.routes.profesor_routes import profesor
import os
from src.config.mongodb import mongo
from src.events.curso_consumer import curso_consumer
from src.events.estudiante_consumer import estudiante_consumer
from src.events.asignacion_consumer import asignacion_consumer
from src.events.admin_consumer import admin_consumer
from src.events.outbox_worker import outbox_worker
import threading
#load_dotenv()

app = Flask(__name__)

app.config['MONGO_URI'] = os.getenv('MONGO_URI')
print("Mongo URI: ", os.getenv("MONGO_URI"))
mongo.init_app(app)

@app.route('/')
def index():
    return "Hello world!"

app.register_blueprint(profesor, url_prefix='/profesor')

if __name__ == '__main__':
    t1 = threading.Thread(target=curso_consumer,args=(app,))
    t1.daemon = True
    t1.start()
    
    t2 = threading.Thread(target=estudiante_consumer,args=(app,))
    t2.daemon = True
    t2.start()

    t3 = threading.Thread(target=asignacion_consumer,args=(app,))
    t3.daemon = True
    t3.start()

    t4 = threading.Thread(target=admin_consumer,args=(app,))
    t4.daemon = True
    t4.start()

    t5 = threading.Thread(target=outbox_worker,args=(app,))
    t5.daemon = True
    t5.start()
    
    app.run(debug=True, use_reloader=False, port=4003, host="0.0.0.0")
