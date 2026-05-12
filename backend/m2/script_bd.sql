CREATE DATABASE IF NOT EXISTS `asignaciones`;
USE `asignaciones` ;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `asignaciones`.`outbox` ;

CREATE TABLE outbox (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50),
    payload JSON,
    status VARCHAR(20) DEFAULT 'PENDING'
);

-- -----------------------------------------------------
-- Table `asignaciones`.`Estudiante`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `asignaciones`.`Estudiante` ;

CREATE TABLE IF NOT EXISTS `asignaciones`.`Estudiante` (
  `idEstudiante` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `correo` VARCHAR(45) NOT NULL,
  `telefono` VARCHAR(45) NOT NULL,
  `usuario` VARCHAR(45) NOT NULL,
  `pass` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`idEstudiante`));


-- -----------------------------------------------------
-- Table `asignaciones`.`Profesor`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `asignaciones`.`Profesor` ;

CREATE TABLE IF NOT EXISTS `asignaciones`.`Profesor` (
  `idProfesor` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `correo` VARCHAR(45) NOT NULL,
  `telefono` VARCHAR(45) NOT NULL,
  `usuario` VARCHAR(45) NOT NULL,
  `pass` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`idProfesor`));


-- -----------------------------------------------------
-- Table `asignaciones`.`Curso`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `asignaciones`.`Curso` ;

CREATE TABLE Curso (
  idCurso INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(45) NOT NULL,
  idProfesor INT NOT NULL,
  FOREIGN KEY (idProfesor) REFERENCES Profesor(idProfesor)
);


-- -----------------------------------------------------
-- Table `asignaciones`.`Asignacion`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `asignaciones`.`Asignacion` ;

CREATE TABLE Asignacion (
  idAsignacion INT AUTO_INCREMENT PRIMARY KEY,
  puntos VARCHAR(45) NOT NULL,
  idEstudiante INT NOT NULL,
  idCurso INT NOT NULL,
  idProfesor INT NOT NULL,
  FOREIGN KEY (idEstudiante) REFERENCES Estudiante(idEstudiante),
  FOREIGN KEY (idCurso) REFERENCES Curso(idCurso),
  FOREIGN KEY (idProfesor) REFERENCES Profesor(idProfesor)
);
    

-- -----------------------------------------------------
-- Table `asignaciones`.`Admin`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `asignaciones`.`Admin` ;

CREATE TABLE Admin (
  idAdmin INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(45) NOT NULL,
  usuario VARCHAR(45) NOT NULL,
  pass VARCHAR(255) NOT NULL
);

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

INSERT INTO Admin (nombre, usuario, pass) VALUES
('Eduardo Cruz', 'eduardoC','eduardoC');


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


SET FOREIGN_KEY_CHECKS=1;
    
