const db = require('../DB/profesor_db.js');
const {cliente_redis, connectRedis} = require('./cliente');

const cliente = cliente_redis;
const STREAM = 'profesor-stream';
const GROUP = 'm2-group';
const CONSUMER = 'consumer-1';

function hasMessages(response) {
    return response && response.some(stream => stream.messages && stream.messages.length > 0);
}

async function readBatch(id, block) {
    const options = { COUNT: 10 };
    if (block) {
        options.BLOCK = block;
    }
    return cliente.xReadGroup(GROUP, CONSUMER, { key: STREAM, id }, options);
}

async function run(){
    while (true) {
        try {
            await connectRedis();
            await cliente.xGroupCreate(STREAM, GROUP, '0',{ MKSTREAM: true });
            break;
        } catch (error) {
            if (String(error?.message).includes('BUSYGROUP')) break;
            console.log(`[redis-stream] Redis no disponible creando grupo ${STREAM}. Reintentando...`, error.message);
            await sleep(5000);
        }
    }

    while(true){
        try {
            let response = await readBatch('0');
            if (!hasMessages(response)) {
                response = await readBatch('>', 5000);
            }

            if(hasMessages(response)){
                const messages = response[0].messages;

                for(const msg of messages){
                const data = msg.message;
                const idProfesor = data.idProfesor;
                const profesor = {
                    nombre: data.nombre,
                    correo: data.correo,
                    telefono: data.telefono,
                    usuario: data.usuario,
                    pass: data.pass
                }
                const profesorCreado = {
                    idProfesor: data.idProfesor,
                    ...profesor
                }

                console.log('Evento recibido', data);

                if(data.event === 'profesor_created'){
                    await db.crear('Profesor',profesorCreado);
                    console.log("Profesor recibido")
                }else if(data.event === 'profesor_update'){
                    await db.actualizar("Profesor", profesor, idProfesor);
                    console.log("Profesor actualizado")
                }else if(data.event === 'profesor_delete'){
                    await db.eliminar('Profesor', idProfesor);
                }

                    await cliente.xAck(STREAM, GROUP, msg.id);
                }
            }
        } catch (error) {
            console.log(`[redis-stream] Error consumer ${STREAM}: ${error.message}`);
            await sleep(5000);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = run;
