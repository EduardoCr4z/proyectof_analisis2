const db = require('../DB/admin_db.js');
const { cliente_redis, connectRedis } = require('./cliente');

const STREAM = 'admin-stream';
const GROUP = 'm2-group';
const CONSUMER = 'consumer-1';
const cliente = cliente_redis;

async function createGroupIfMissing() {
    try {
        await cliente.xGroupCreate(STREAM, GROUP, '0', { MKSTREAM: true });
        console.log(`[redis-stream] Grupo creado stream=${STREAM} group=${GROUP}`);
    } catch (error) {
        if (!String(error?.message).includes('BUSYGROUP')) {
            throw error;
        }
        console.log(`[redis-stream] Grupo ya existe stream=${STREAM} group=${GROUP}`);
    }
}

async function readBatch(id, block) {
    const options = { COUNT: 10 };
    if (block) {
        options.BLOCK = block;
    }

    return cliente.xReadGroup(
        GROUP,
        CONSUMER,
        { key: STREAM, id },
        options
    );
}

function hasMessages(response) {
    return response && response.some(stream => stream.messages && stream.messages.length > 0);
}

async function processMessage(msg) {
    const data = msg.message;
    const idAdmin = data.idAdmin;
    const admin = {
        nombre: data.nombre,
        usuario: data.usuario,
        pass: data.pass
    };

    console.log('[redis-stream] Evento admin recibido', data);

    if (data.event === 'admin_created') {
        await db.crear('Admin', { idAdmin, ...admin });
    } else if (data.event === 'admin_updated' || data.event === 'admin_update') {
        await db.actualizar('Admin', admin, idAdmin);
    } else if (data.event === 'admin_deleted' || data.event === 'admin_delete') {
        await db.eliminar('Admin', idAdmin);
    }

    await cliente.xAck(STREAM, GROUP, msg.id);
    console.log(`[redis-stream] ACK stream=${STREAM} group=${GROUP} id=${msg.id}`);
}

async function run(){
    while (true) {
        try {
            await connectRedis();
            await createGroupIfMissing();
            break;
        } catch (error) {
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
            if (!hasMessages(response)) continue;

            for (const stream of response) {
                for (const msg of stream.messages) {
                    await processMessage(msg);
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
