const app = require('./app');
const PORT = app.get('port') || 3000;
const runConsumerCurso = require('./redis_consumer/consumer_curso')
const runConsumerProfesor = require('./redis_consumer/consumer_profesor')
const runConsumerAdmin = require('./redis_consumer/consumer_admin')
const startOutboxWorker = require('./redis_publisher/outbox_worker')

app.listen(PORT,'0.0.0.0', () => {
    try {
        runConsumerCurso();
        runConsumerProfesor();
        runConsumerAdmin();
        startOutboxWorker();
    } catch (error) {
        console.log(error);
    }
    console.log("Servidor escuchando en el puerto ", app.get("port"))
});
