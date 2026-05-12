const request = require('supertest');
const app = require('../app');

// Mock de la base de datos
jest.mock('../DB/estudiante_db', () => ({
    leer: jest.fn(() => Promise.resolve([
        { idEstudiante: 1, nombre: 'Juan' }
    ])),
    crear: jest.fn(() => Promise.resolve({
        nombre: "Carlos",
        correo: "carlos@gmail.com",
        telefono: "45454545"
    }))
}));

jest.mock('../keycloak/keycloak_admin', () => ({
    createUserWithRole: jest.fn(() => Promise.resolve({
        id: 'test-keycloak-user',
        role: 'Estudiantes'
    }))
}));

describe('GET /api/estudiantes', () => {

    it('Debe devolver lista de estudiantes', async () => {
        const response = await request(app)
            .get('/api/estudiantes/leer')
            .expect(200);

        expect(response.body.error).toBe(false);
        expect(response.body.body.length).toBeGreaterThan(0);
        expect(response.body.body[0].nombre).toBe('Juan');
    });

});

describe('POST /api/estudiantes', () => {

    it('Debe crear un estudiante', async () => {

        const nuevoEstudiante = {
            nombre: "Carlos",
            correo: "carlos@gmail.com",
            telefono: "45454545"
        };

        const response = await request(app)
            .post('/api/estudiantes/crear')
            .send(nuevoEstudiante)
            .expect(201);

        expect(response.body.error).toBe(false);
    });

});

