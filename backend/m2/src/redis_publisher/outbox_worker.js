const outbox = require('../DB/outbox_db');
const publisher = require('./publisher');

let running = false;

async function flushPending() {
    if (running) return;
    running = true;

    try {
        const eventos = await outbox.pendientes();
        for (const evento of eventos) {
            try {
                const payload = typeof evento.payload === 'string'
                    ? JSON.parse(evento.payload)
                    : evento.payload;

                await publisher.publishDirect(evento.event_type, payload);
                await outbox.marcarEnviado(evento.id);
                console.log(`[outbox] Evento reenviado stream=${evento.event_type} id=${evento.id}`);
            } catch (error) {
                console.log(`[outbox] Redis sigue no disponible. Reintento despues: ${error.message}`);
                break;
            }
        }
    } catch (error) {
        console.log(`[outbox] Error leyendo outbox: ${error.message}`);
    } finally {
        running = false;
    }
}

function startOutboxWorker() {
    setInterval(flushPending, 5000);
    flushPending();
}

module.exports = startOutboxWorker;
