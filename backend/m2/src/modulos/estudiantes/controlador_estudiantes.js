const db = require('../../DB/estudiante_db');
const keycloakAdmin = require('../../keycloak/keycloak_admin');

const TABLA = 'Estudiante'
function leer (){
    return db.leer(TABLA);
}

function leer_con_curso (){
    return db.leer_con_curso();
}

async function crear (data){
    const result = await db.crear(TABLA, data);
    const keycloak = await keycloakAdmin.createUserWithRole(data, 'Estudiantes');
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
    leer_con_curso,
    crear,
    eliminar,
    actualizar
}
