const pool = require('./pool')

function crear(tabla, data){
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO ${tabla} SET ?`, data, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        })
    })
}

function leer(tabla){
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM ${tabla}`, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        })
    })
}

function actualizar(tabla, data, id){
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE ${tabla} SET ? WHERE idAdmin = ?`, [data, id], (error, result) => {
            if (error) return reject(error);
            resolve(result);
        })
    })
}

function eliminar(tabla, id){
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM ${tabla} WHERE idAdmin = ?`, [id], (error, result) => {
            if (error) return reject(error);
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
