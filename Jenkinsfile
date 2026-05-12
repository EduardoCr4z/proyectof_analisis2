def runCmd(String command) {
    if (isUnix()) {
        sh command
    } else {
        bat command
    }
}

pipeline {
    agent any

    parameters {
        booleanParam(
            name: 'RESET_DATA',
            defaultValue: true,
            description: 'Elimina volumenes de bases de datos antes de desplegar para cargar scripts iniciales y realm de Keycloak.'
        )
    }

    environment {
        COMPOSE_FILE = 'deploy/docker-compose.jenkins.yml'
        COMPOSE_PROJECT_NAME = 'universidad'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Validar M1') {
            steps {
                dir('backend/m1/universidad') {
                    script {
                        runCmd('mvn -q -DskipTests package')
                    }
                }
            }
        }

        stage('Validar M2') {
            steps {
                dir('backend/m2') {
                    script {
                        runCmd('npm ci')
                        runCmd('npm test -- --runInBand')
                    }
                }
            }
        }

        stage('Validar Frontend') {
            steps {
                dir('frontend/frontend_universidad') {
                    script {
                        runCmd('npm ci')
                        runCmd('npm run build')
                    }
                }
            }
        }

        stage('Construir Imagenes') {
            steps {
                script {
                    runCmd("docker compose -f ${env.COMPOSE_FILE} build")
                }
            }
        }

        stage('Reiniciar Datos Iniciales') {
            when {
                expression { return params.RESET_DATA }
            }
            steps {
                script {
                    runCmd("docker compose -f ${env.COMPOSE_FILE} down -v --remove-orphans")
                }
            }
        }

        stage('Desplegar') {
            steps {
                script {
                    runCmd("docker compose -f ${env.COMPOSE_FILE} up -d --remove-orphans")
                }
            }
        }

        stage('Estado') {
            steps {
                script {
                    runCmd("docker compose -f ${env.COMPOSE_FILE} ps")
                }
            }
        }
    }

    post {
        failure {
            script {
                runCmd("docker compose -f ${env.COMPOSE_FILE} ps")
            }
        }
    }
}
