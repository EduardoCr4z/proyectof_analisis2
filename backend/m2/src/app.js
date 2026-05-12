const express = require('express');
const config = require('./config');
const path = require('path');
const cors = require("cors");


const estudiantes = require('./modulos/estudiantes/rutas_estudiantes');
const profesores = require('./modulos/profesores/rutas_profesores');
const cursos = require('./modulos/cursos/rutas_cursos');
const asignaciones = require('./modulos/asignaciones/rutas_asignaciones');
const admins = require('./modulos/admins/rutas_admins');



const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET","POST","PUT","DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

//Configuración
app.set('port', config.app.port);

app.use(express.static(path.resolve(__dirname, '..', 'public')));

app.use(express.json());
//Rutas
// Estudiantes
app.use('/api/estudiantes', estudiantes);
// Profesores
app.use('/api/profesores', profesores);
// Cursos
app.use('/api/cursos', cursos);
// Asignaciones
app.use('/api/asignaciones', asignaciones);
// Admins
app.use('/api/admins', admins);

module.exports = app;
