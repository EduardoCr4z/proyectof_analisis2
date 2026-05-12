const { cliente_redis, connectRedis } = require('../redis_consumer/cliente');
const outbox = require('../DB/outbox_db');

const cliente = cliente_redis;

cliente.on('error', (err) => console.error('Redis Error:', err));

function normalizeStreamData(data) {
    return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value == null ? '' : String(value)])
    );
}

async function publish(stream, data) {
    try {
        const payload = normalizeStreamData(data);
        return await publishDirect(stream, payload);
    } catch (error) {
        const payload = normalizeStreamData(data);
        console.error(`[redis-stream] Redis no disponible. Guardando outbox stream=${stream}:`, error.message);
        await outbox.guardarPendiente(stream, payload);
        return null;
    }
}

async function publishDirect(stream, data) {
    await connectRedis();
    const payload = normalizeStreamData(data);
    const id = await cliente.xAdd(stream, '*', payload);
    console.log(`[redis-stream] XADD stream=${stream} id=${id}`, payload);
    return id;
}

module.exports = {
    publish,
    publishDirect
};
