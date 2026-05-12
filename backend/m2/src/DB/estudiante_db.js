const pool = require('./pool')
const publisher = require('../redis_publisher/publisher');
const crypto = require('crypto');

function crear(tabla, data){
    return new Promise ((resolve, reject) =>{
        pool.query(`INSERT INTO ${tabla} SET ?`,data, async (error, result) => {
            if(error) return reject(error);
            const passw = crypto.createHash('sha256').update(data.pass).digest('hex');
            const evento = {
                event: 'estudiante_created',
                idEstudiante: result.insertId.toString(),
                nombre: data.nombre,
                correo: data.correo,
                telefono: data.telefono,
                usuario: data.usuario,
                pass: passw

            };

            await publisher.publish('estudiante-stream', evento);

            resolve(result);
        })
    })
}

function leer(tabla){
    return new Promise ( (resolve, reject) =>{
        pool.query(`SELECT * FROM ${tabla}`, (error, result) => {
            if(error) return reject(error);
            resolve(result);
        })
    })
}


function leer_con_curso(){
    return new Promise ((resolve, reject) =>{
        pool.query(`SELECT 
                    e.idEstudiante,
                    e.nombre AS estudiante,
                    c.nombre AS curso,
                    p.nombre AS profesor
                    FROM Estudiante e
                    LEFT JOIN Asignacion a ON e.idEstudiante = a.idEstudiante
                    LEFT JOIN Curso c ON a.idCurso = c.idCurso
                    LEFT JOIN Profesor p ON a.idProfesor = p.idProfesor
                    ORDER BY e.idEstudiante;`, (error, result) => {
            if(error) return reject(error);
            resolve(result);
        })
    })
}

function actualizar(tabla, data, id){
    return new Promise ( (resolve, reject) =>{
        pool.query(`UPDATE ${tabla} SET ? WHERE idEstudiante = ?`,[data, id], async (error, result) => {
            if(error) return reject(error);
            const evento = {
                event: 'estudiante_updated',
                idEstudiante: id.toString(),
                nombre: data.nombre,
                correo: data.correo,
                telefono: data.telefono,
                usuario: data.usuario,
                pass: data.pass
            };
            await publisher.publish('estudiante-stream', evento);
            resolve(result);
        })
    })
}

function eliminar(tabla, id){
    return new Promise ( (resolve, reject) =>{
        pool.query(`DELETE FROM ${tabla} WHERE idEstudiante = ?`,[id], async (error, result) => {
            if(error) return reject(error);
            const evento = {
                event: 'estudiante_deleted',
                idEstudiante: id.toString()
            };

            await publisher.publish('estudiante-stream', evento);
            resolve(result);
        })
    })
}

module.exports = {
    crear,
    leer,
    leer_con_curso,
    actualizar,
    eliminar
}