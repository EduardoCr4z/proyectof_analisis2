const express = require('express');

const respuesta = require('../../red/respuestas');

const controlador = require('./controlador_profesores')

const router = express.Router();

router.get('/leer', function(req, res){
    const leer = controlador.leer()
    .then((items) => {
        respuesta.success(req, res, items, 200);
    });
});

router.post('/crear', function(req, res){
    controlador.crear(req.body)
    .then((item) => {
        respuesta.success(req, res, item, 201);
    })
    .catch(err => {
        respuesta.error(req, res, err.message, 500);
    });
});

router.delete('/eliminar/:id', function(req, res){
    const id = req.params.id
    controlador.eliminar(id)
    .then((item) => {
        respuesta.success(req, res, item, 201);
    })
    .catch(err => {
        respuesta.error(req, res, err.message, 500);
        //console.log(err);
    });
});

router.put('/actualizar/:id', function(req, res){
    const id = req.params.id
    controlador.actualizar(req.body, id)
    .then((item) => {
        respuesta.success(req, res, item, 201);
    })
    .catch(err => {
        respuesta.error(req, res, err.message, 500);
        //console.log(err);
    });
});


module.exports = router;