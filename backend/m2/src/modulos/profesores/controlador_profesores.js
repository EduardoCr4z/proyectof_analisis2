const db = require('../../DB/profesor_db');
const keycloakAdmin = require('../../keycloak/keycloak_admin');

const TABLA = 'Profesor'
function leer (){
    return db.leer(TABLA);
}

async function crear (data){
    const result = await db.crear(TABLA, data);
    const keycloak = await keycloakAdmin.createUserWithRole(data, 'Profesores');
    return { ...result, keycloak };
}

function eliminar (data){
    return db.eliminar(TABLA, data);
}
function actualizar (data, id){
    return db.actualizar(TABLA, data, id)
}


module.exports = {
    leer,
    crear,
    eliminar,
    actualizar
}
