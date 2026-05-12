use('asignaciones')

// -----------------------------------------------------
// OUTBOX
// -----------------------------------------------------
db.outbox.insertMany([
  {
    _id: 1,
    event_type: "USER_CREATED",
    payload: { user_id: 123, name: "Juan" },
    status: "PENDING"
  }
]);

// -----------------------------------------------------
// ESTUDIANTE
// -----------------------------------------------------
db.estudiante.insertMany([
  { _id: 1, nombre: "Juan Pérez", correo: "juan.perez@email.com", telefono: "555-1001", usuario: "juanP", pass: "1234" },
  { _id: 2, nombre: "María López", correo: "maria.lopez@email.com", telefono: "555-1002", usuario: "mariaL", pass: "5678" },
  { _id: 3, nombre: "Carlos Ramírez", correo: "carlos.ramirez@email.com", telefono: "555-1003", usuario: "carlosR", pass: "carlosR" },
  { _id: 4, nombre: "Ana Torres", correo: "ana.torres@email.com", telefono: "555-1004", usuario: "anaT", pass: "anaT" },
  { _id: 5, nombre: "Luis Mendoza", correo: "luis.mendoza@email.com", telefono: "555-1005", usuario: "luisM", pass: "luisM" }
]);

// -----------------------------------------------------
// PROFESOR
// -----------------------------------------------------
db.profesor.insertMany([
  { _id: 1, nombre: "Dr. Roberto García", correo: "roberto.garcia@email.com", telefono: "555-2001", usuario: "robertoG", pass: "robertoG" },
  { _id: 2, nombre: "Dra. Patricia Sánchez", correo: "patricia.sanchez@email.com", telefono: "555-2002", usuario: "patriciaS", pass: "patriciaS" },
  { _id: 3, nombre: "Ing. Fernando Díaz", correo: "fernando.diaz@email.com", telefono: "555-2003", usuario: "fernandoD", pass: "fernandoD" },
  { _id: 4, nombre: "Lic. Gabriela Morales", correo: "gabriela.morales@email.com", telefono: "555-2004", usuario: "gabrielaM", pass: "gabrielaM" },
  { _id: 5, nombre: "Mtro. Andrés Castillo", correo: "andres.castillo@email.com", telefono: "555-2005", usuario: "andresC", pass: "andresC" }
]);

// -----------------------------------------------------
// ADMIN
// -----------------------------------------------------
db.admin.insertMany([
  { _id: 1, nombre: "Eduardo Cruz", correo: "cr4zsanchez@email.com", telefono: "555-2001", usuario: "eduardoC", pass: "eduardoC" }
]);

// -----------------------------------------------------
// CURSO (referencia por idProfesor)
// -----------------------------------------------------
db.curso.insertMany([
  { _id: 1, nombre: "Matemáticas I", idProfesor: 1 },
  { _id: 2, nombre: "Física I", idProfesor: 2 },
  { _id: 3, nombre: "Programación I", idProfesor: 3 },
  { _id: 4, nombre: "Historia Universal", idProfesor: 4 },
  { _id: 5, nombre: "Base de Datos", idProfesor: 5 }
]);

// -----------------------------------------------------
// ASIGNACION (referencias como FK)
// -----------------------------------------------------
db.asignacion.insertMany([

  // Estudiante 1
  { _id: 1, puntos: "90", idEstudiante: 1, idCurso: 1, idProfesor: 1 },
  { _id: 2, puntos: "85", idEstudiante: 1, idCurso: 3, idProfesor: 3 },

  // Estudiante 2
  { _id: 3, puntos: "88", idEstudiante: 2, idCurso: 2, idProfesor: 2 },
  { _id: 4, puntos: "92", idEstudiante: 2, idCurso: 4, idProfesor: 4 },

  // Estudiante 3
  { _id: 5, puntos: "75", idEstudiante: 3, idCurso: 3, idProfesor: 3 },
  { _id: 6, puntos: "89", idEstudiante: 3, idCurso: 5, idProfesor: 5 },

  // Estudiante 4
  { _id: 7, puntos: "95", idEstudiante: 4, idCurso: 1, idProfesor: 1 },
  { _id: 8, puntos: "80", idEstudiante: 4, idCurso: 2, idProfesor: 2 },

  // Estudiante 5
  { _id: 9, puntos: "78", idEstudiante: 5, idCurso: 4, idProfesor: 4 },
  { _id: 10, puntos: "91", idEstudiante: 5, idCurso: 5, idProfesor: 5 }

]);