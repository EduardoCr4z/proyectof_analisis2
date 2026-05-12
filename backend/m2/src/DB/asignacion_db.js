const pool = require('./pool')
const publisher = require('../redis_publisher/publisher');

function crear(tabla, data){
    return new Promise ( (resolve, reject) =>{
        pool.query(
            `SELECT idAsignacion FROM ${tabla} WHERE idEstudiante = ? AND idCurso = ? LIMIT 1`,
            [data.idEstudiante, data.idCurso],
            (error, rows) => {
                if(error) return reject(error);
                if(rows.length) return reject(new Error('El estudiante ya esta asignado a este curso'));

                pool.query(`INSERT INTO ${tabla} SET ?`, data, async (error, result) => {
            if(error) return reject(error);
            const evento = {
                event: 'asignacion_created',
                idAsignacion: result.insertId.toString(),
                puntos: data.puntos,
                idEstudiante: data.idEstudiante,
                idCurso: data.idCurso,
                idProfesor: data.idProfesor
            };
            
            await publisher.publish('asignacion-stream', evento);
            resolve(result);
        })
            }
        )
    })
}

function leer(tabla){
    return new Promise ((resolve, reject) =>{
        pool.query(`SELECT * FROM ${tabla}`, (error, result) => {
            if(error) return reject(error);
            resolve(result);
        })
    })
}


function actualizar(tabla, data, id){
    return new Promise ( (resolve, reject) =>{
        pool.query(`UPDATE ${tabla} SET ? WHERE idAsignacion = ?`,[data, id], async (error, result) => {
            if(error) return reject(error);
            const evento = {
                event: 'asignacion_updated',
                idAsignacion: id.toString(),
                puntos: data.puntos,
                idEstudiante: data.idEstudiante,
                idCurso: data.idCurso,
                idProfesor: data.idProfesor
            };
            await publisher.publish('asignacion-stream', evento);
            resolve(result);
        })
    })
}

function eliminar(tabla, id){
    return new Promise ( (resolve, reject) =>{
        pool.query(`DELETE FROM ${tabla} WHERE idAsignacion = ?`,[id], async (error, result) => {
            if(error) return reject(error);
            const evento = {
                event: 'asignacion_deleted',
                idAsignacion: id.toString()
            };
            
            await publisher.publish('asignacion-stream', evento);
            resolve(result);
        })
    })
}

module.exports = {
    crear,
    leer,
    actualizar,
    eliminar
}
