def runCmd(String command) {
    if (isUnix()) {
        sh command
    } else {
        bat command
    }
}

def resetInitialData() {
    if (isUnix()) {
        sh """
            docker compose -p universidad -f ${env.COMPOSE_FILE} down -v || true
            docker rm -f universidad-redis universidad-postgres universidad-mysql universidad-mongo universidad-keycloak-mysql universidad-keycloak universidad-m1 universidad-m2 universidad-m3 universidad-frontend || true
            docker volume rm universidad_pg_data universidad_mysql_data universidad_mongo_data universidad_keycloak_mysql_data deploy_pg_data deploy_mysql_data deploy_mongo_data deploy_keycloak_mysql_data || true
        """
    } else {
        bat """
            docker compose -p universidad -f %COMPOSE_FILE% down -v
            docker rm -f universidad-redis universidad-postgres universidad-mysql universidad-mongo universidad-keycloak-mysql universidad-keycloak universidad-m1 universidad-m2 universidad-m3 universidad-frontend
            docker volume rm universidad_pg_data universidad_mysql_data universidad_mongo_data universidad_keycloak_mysql_data deploy_pg_data deploy_mysql_data deploy_mongo_data deploy_keycloak_mysql_data
            exit /b 0
        """
    }
}

def verifyInitialData() {
    if (isUnix()) {
        sh '''
            set -e

            echo "Esperando MySQL..."
            for i in $(seq 1 90); do
                if docker exec universidad-mysql mysqladmin ping -h127.0.0.1 -uroot -p123456 --silent; then
                    break
                fi

                if [ "$i" -eq 90 ]; then
                    echo "MySQL no estuvo listo a tiempo. Ultimos logs:"
                    docker logs --tail 120 universidad-mysql
                    exit 1
                fi

                sleep 2
            done

            docker exec universidad-mysql mysql -h127.0.0.1 -uroot -p123456 asignaciones -e "SELECT COUNT(*) AS estudiantes FROM Estudiante; SELECT COUNT(*) AS profesores FROM Profesor; SELECT COUNT(*) AS admins FROM Admin;"

            echo "Esperando Keycloak..."
            for i in $(seq 1 90); do
                if docker exec universidad-keycloak /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password 123456 >/dev/null 2>&1; then
                    break
                fi

                if [ "$i" -eq 90 ]; then
                    echo "Keycloak no estuvo listo a tiempo. Ultimos logs:"
                    docker logs --tail 160 universidad-keycloak
                    exit 1
                fi

                sleep 2
            done

            docker exec universidad-keycloak /opt/keycloak/bin/kcadm.sh get realms/Universidad
            docker exec universidad-keycloak /opt/keycloak/bin/kcadm.sh get users -r Universidad -q username=eduardoC
        '''
    } else {
        bat '''
            @echo off
            echo Esperando MySQL...
            for /L %%i in (1,1,90) do (
                docker exec universidad-mysql mysqladmin ping -h127.0.0.1 -uroot -p123456 --silent
                if not errorlevel 1 goto mysql_ready
                timeout /t 2 /nobreak > nul
            )
            echo MySQL no estuvo listo a tiempo. Ultimos logs:
            docker logs --tail 120 universidad-mysql
            exit /b 1

            :mysql_ready
            docker exec universidad-mysql mysql -h127.0.0.1 -uroot -p123456 asignaciones -e "SELECT COUNT(*) AS estudiantes FROM Estudiante; SELECT COUNT(*) AS profesores FROM Profesor; SELECT COUNT(*) AS admins FROM Admin;"
            if errorlevel 1 exit /b 1

            echo Esperando Keycloak...
            for /L %%i in (1,1,90) do (
                docker exec universidad-keycloak /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password 123456
                if not errorlevel 1 goto keycloak_ready
                timeout /t 2 /nobreak > nul
            )
            echo Keycloak no estuvo listo a tiempo. Ultimos logs:
            docker logs --tail 160 universidad-keycloak
            exit /b 1

            :keycloak_ready
            docker exec universidad-keycloak /opt/keycloak/bin/kcadm.sh get realms/Universidad
            docker exec universidad-keycloak /opt/keycloak/bin/kcadm.sh get users -r Universidad -q username=eduardoC
        '''
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
                    resetInitialData()
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

        stage('Verificar Datos Iniciales') {
            steps {
                script {
                    verifyInitialData()
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
