const db = require('../DB/curso_db.js');
const {cliente_redis, connectRedis} = require('./cliente');

const cliente = cliente_redis;
const STREAM = 'curso-stream';
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
                const idCurso = data.idCurso;
                const curso = {
                    nombre: data.nombre,
                    idProfesor: data.idProfesor
                }
                const cursoCreado = {
                    idCurso: data.idCurso,
                    nombre: data.nombre,
                    idProfesor: data.idProfesor
                }

                console.log('Evento recibido', data);

                if(data.event === 'curso_created'){
                    await db.crear('Curso', cursoCreado);
                }else if(data.event === 'curso_update'){
                    console.log("NODE idCurso: " + idCurso)
                    console.log("NODE nombre: " + curso.nombre)
                    console.log("NODE idProfesor: " + curso.idProfesor)

                    await db.actualizar("Curso", curso, idCurso);
                }else if(data.event === 'curso_delete'){
                    await db.eliminar('Curso', data.idCurso);
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
