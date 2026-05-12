const pool = require('./pool')

function guardarPendiente(stream, payload){
    return new Promise((resolve, reject) => {
        pool.query(
            'INSERT INTO outbox (event_type, payload, status) VALUES (?, ?, ?)',
            [stream, JSON.stringify(payload), 'PENDING'],
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        )
    })
}

function pendientes(){
    return new Promise((resolve, reject) => {
        pool.query(
            "SELECT id, event_type, payload FROM outbox WHERE status = 'PENDING' AND event_type LIKE '%-stream' ORDER BY id ASC LIMIT 50",
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        )
    })
}

function marcarEnviado(id){
    return new Promise((resolve, reject) => {
        pool.query(
            "UPDATE outbox SET status = 'SENT' WHERE id = ?",
            [id],
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        )
    })
}

module.exports = {
    guardarPendiente,
    pendientes,
    marcarEnviado
}
