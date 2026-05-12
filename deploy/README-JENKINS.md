# Despliegue con Jenkins

Este proyecto incluye un `Jenkinsfile` y un `docker-compose.jenkins.yml` para construir y desplegar los microservicios.

## Requisitos del agente Jenkins

- Docker y Docker Compose disponibles. Si usas `deploy/docker-compose.yml`, la imagen personalizada de Jenkins ya incluye Docker CLI, Docker Compose v2, Maven y Node/npm.
- El usuario que ejecuta Jenkins debe tener permiso para usar Docker.

## Archivos principales

- `Jenkinsfile`: pipeline declarativo.
- `docker-compose.jenkins.yml`: despliegue completo de Redis, bases de datos, Keycloak, microservicios y frontend.
- `keycloak/realm-universidad.json`: realm `Universidad` con cliente `front_react`, roles y usuarios iniciales.
- `.env.jenkins.example`: variables que puedes copiar como `.env` en el workspace de Jenkins si quieres cambiar credenciales o URLs.

## URLs publicadas

- Frontend: `http://localhost:3000`
- M1 Spring Boot: `http://localhost:4001`
- M2 Node.js: `http://localhost:4002`
- M3 Flask: `http://localhost:4003`
- Keycloak: `http://localhost:8091`

## Usuarios iniciales

- Admin: `eduardoC` / `eduardoC`
- Estudiante: `juanP` / `1234`
- Estudiante: `mariaL` / `5678`
- Profesor: `robertoG` / `robertoG`

El import automatico de Keycloak se ejecuta al iniciar el contenedor con una base de datos de Keycloak vacia. Si ya existe el volumen `keycloak_mysql_data`, elimina el despliegue con volumenes antes de probar el import desde cero:

```bat
docker compose -f deploy/docker-compose.jenkins.yml down -v
```

El pipeline incluye el parametro `RESET_DATA`, activado por defecto, para ejecutar ese reinicio automaticamente antes de desplegar. Desactivalo cuando quieras conservar datos existentes.

## Levantar Jenkins

```bat
docker compose -f deploy/docker-compose.yml up -d --build
```

Luego entra a Jenkins en `http://localhost:8081`.

## Ejecucion manual equivalente del despliegue

```bat
docker compose -f deploy/docker-compose.jenkins.yml build
docker compose -f deploy/docker-compose.jenkins.yml up -d --remove-orphans
docker compose -f deploy/docker-compose.jenkins.yml ps
```

Para detener el despliegue:

```bat
docker compose -f deploy/docker-compose.jenkins.yml down
```
