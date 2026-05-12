DROP TABLE IF EXISTS Asignacion;
DROP TABLE IF EXISTS Curso;
DROP TABLE IF EXISTS Admin;
DROP TABLE IF EXISTS Profesor;
DROP TABLE IF EXISTS Estudiante;
DROP TABLE IF EXISTS outbox;

CREATE TABLE outbox (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50),
    payload JSONB,
    status VARCHAR(20) DEFAULT 'PENDING'
);

-- -----------------------------------------------------
-- Tabla Estudiante
-- -----------------------------------------------------
DROP TABLE IF EXISTS Estudiante;

CREATE TABLE Estudiante (
  idEstudiante SERIAL PRIMARY KEY,
  nombre VARCHAR(45) NOT NULL,
  correo VARCHAR(45) NOT NULL,
  telefono VARCHAR(45) NOT NULL,
  usuario VARCHAR(45) NOT NULL,
  pass VARCHAR(255) NOT NULL
);

-- -----------------------------------------------------
-- Tabla Profesor
-- -----------------------------------------------------
DROP TABLE IF EXISTS Profesor;

CREATE TABLE Profesor (
  idProfesor SERIAL PRIMARY KEY,
  nombre VARCHAR(45) NOT NULL,
  correo VARCHAR(45) NOT NULL,
  telefono VARCHAR(45) NOT NULL,
  usuario VARCHAR(45) NOT NULL,
  pass VARCHAR(255) NOT NULL
);

-- -----------------------------------------------------
-- Tabla Curso
-- -----------------------------------------------------
DROP TABLE IF EXISTS Curso;

CREATE TABLE Curso (
  idCurso SERIAL,
  idProfesor INT NOT NULL,
  nombre VARCHAR(45) NOT NULL,
  PRIMARY KEY (idCurso, idProfesor),
  FOREIGN KEY (idProfesor)
    REFERENCES Profesor (idProfesor)
);

-- -----------------------------------------------------
-- Tabla Asignacion
-- -----------------------------------------------------
DROP TABLE IF EXISTS Asignacion;

CREATE TABLE Asignacion (
  idAsignacion SERIAL,
  puntos VARCHAR(45) NOT NULL,
  idEstudiante INT NOT NULL,
  idCurso INT NOT NULL,
  idProfesor INT NOT NULL,
  PRIMARY KEY (idAsignacion, idEstudiante, idCurso, idProfesor),
  FOREIGN KEY (idEstudiante)
    REFERENCES Estudiante (idEstudiante),
  FOREIGN KEY (idCurso, idProfesor)
    REFERENCES Curso (idCurso, idProfesor)
);

-- -----------------------------------------------------
-- Tabla Admin
-- -----------------------------------------------------
DROP TABLE IF EXISTS Admin;

CREATE TABLE Admin (
  idAdmin SERIAL PRIMARY KEY,
  nombre VARCHAR(45) NOT NULL,
  correo VARCHAR(45) NOT NULL,
  telefono VARCHAR(45) NOT NULL,
  usuario VARCHAR(45) NOT NULL,
  pass VARCHAR(255) NOT NULL
);

-- -----------------------------------------------------
-- Inserts
-- -----------------------------------------------------

INSERT INTO Estudiante (nombre, correo, telefono, usuario, pass) VALUES
('Juan Pérez', 'juan.perez@email.com', '555-1001', 'juanP','1234'),
('María López', 'maria.lopez@email.com', '555-1002','mariaL','5678'),
('Carlos Ramírez', 'carlos.ramirez@email.com', '555-1003','carlosR','carlosR'),
('Ana Torres', 'ana.torres@email.com', '555-1004','anaT','anaT'),
('Luis Mendoza', 'luis.mendoza@email.com', '555-1005','luisM','luisM');

INSERT INTO Profesor (nombre, correo, telefono, usuario, pass) VALUES
('Dr. Roberto García', 'roberto.garcia@email.com', '555-2001', 'robertoG','robertoG'),
('Dra. Patricia Sánchez', 'patricia.sanchez@email.com', '555-2002', 'patriciaS','patriciaS'),
('Ing. Fernando Díaz', 'fernando.diaz@email.com', '555-2003', 'fernandoD','fernandoD'),
('Lic. Gabriela Morales', 'gabriela.morales@email.com', '555-2004', 'gabrielaM','gabrielaM'),
('Mtro. Andrés Castillo', 'andres.castillo@email.com', '555-2005', 'andresC','andresC');

INSERT INTO Admin (nombre, correo, telefono, usuario, pass) VALUES
('Eduardo Cruz', 'cr4zsanchez@email.com', '555-2001', 'eduardoC','eduardoC');

INSERT INTO Curso (nombre, idProfesor) VALUES
('Matemáticas I', 1),
('Física I', 2),
('Programación I', 3),
('Historia Universal', 4),
('Base de Datos', 5);

INSERT INTO Asignacion 
(puntos, idEstudiante, idCurso, idProfesor) VALUES

-- Estudiante 1
('90', 1, 1, 1),
('85', 1, 3, 3),

-- Estudiante 2
('88', 2, 2, 2),
('92', 2, 4, 4),

-- Estudiante 3
('75', 3, 3, 3),
('89', 3, 5, 5),

-- Estudiante 4
('95', 4, 1, 1),
('80', 4, 2, 2),

-- Estudiante 5
('78', 5, 4, 4),
('91', 5, 5, 5);
