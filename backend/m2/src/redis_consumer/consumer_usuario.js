const controlador = require('../modulos/cursos/controlador_cursos.js')
const db = require('../DB/curso_db.js');
const {cliente_redis, connectRedis} = require('./cliente');

const cliente = cliente_redis;

async function run(){
    await connectRedis();
    // Suscripcion al stream de usuario
    try {
        await cliente.xGroupCreate('usuario-stream', 'm2-group', '0',{
            MKSTREAM: true
        });
    } catch (error) {
        if (!String(error?.message).includes('BUSYGROUP')) {
            console.log(error);
        }
    }

    while(true){
        const response = await cliente.xReadGroup(
            'm2-group',
            'consumer-1',
            { key: 'usuario-stream', id: '>' },
            { COUNT: 1, BLOCK: 5000 }
        );

        if(response){
            const messages = response[0].messages;

            for(const msg of messages){
                const data = msg.message;
                const idProfesor = data.idProfesor;
                const profesor = {
                    nombre: data.nombre,
                    correo: data.correo,
                    telefono: data.telefono
                }

                console.log('Evento recibido', data);

                if(data.event === 'usuario_created'){
                    db.crear('Usuario',profesor);
                    console.log("Usuario recibido")
                }else if(data.event === 'usuario_update'){
                    db.actualizar("Usuario", profesor, idProfesor);
                    console.log("Usuario actualizado")
                }else if(data.event === 'usuario_delete'){
                    db.eliminar('Usuario', idProfesor);
                }

                await cliente.xAck('usuario-stream', 'm2-group', msg.id);
            }
        }
    }
}

module.exports = run;
