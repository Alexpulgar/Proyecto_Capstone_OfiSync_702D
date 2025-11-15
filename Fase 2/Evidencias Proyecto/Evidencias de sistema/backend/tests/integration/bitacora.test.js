const request = require('supertest');
const { app } = require('../index');
const { pool } = require('../models/db');
const jwt = require('jsonwebtoken');
const { crearEntrada } = require('../../controllers/bitacoraController');

let adminToken;
let entradaId;

beforeAll(async() => {
    await pool.query("DELETE FROM bitacora");

    const adminUser = {
        id: 999, //id de prueba
        nombre_usuario: "Test Admin",
        email: "admin@test.com",
        rol: "administrador",
    };

    adminToken = jwt.sign(adminUser, process.env.JWT_SECRET, { expiresIn: '1hr'});
});

//mockear los middlewares de autentificacion antes de cada test
beforeEach(() => {
    jest.mock('../../middlewares/AuthMiddleware' , () => (req, res, next) => {
        req.user = {
            id: 999,
            nombre_usuario: "Test Admin",
            rol: "administrador",
        };
        next();
    });

    jest.mock('../../middlewares/checkRoleMiddleware', () => (roles) => (req, res, next) => {
        next();
    });
});

//limpiar la bd despues de los test
afterAll(async () => {
    await pool.query("DELETE FROM bitacora");
    await pool.end();
});

describe('Prueba de integracios para Endpoints de Bitacora', ()=> {
    //test crear
    describe('POST /api/bitacora', () => {
        it('deberia crear una nueva entrada de bitacora', async () => {
            const res = await request(app)
            .post('/api/bitacora')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                titulo: "Test de Integracion",
                descripcion: "Descripcion para el test de integracion",
            });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.titulo).toBe("Test de Integracion");
            // Verificamos que el autor sea el del middleware mockeado
            expect(res.body.autor_nombre).toBe("Test Admin");

            entradaId = res.body.id;
        });
        
        it('deberia retornar 400 si el titulo falta (validacion Joi)', async () => {
            const res = await request(app)
            .post('/api/bitacora')
            .set('Authorization' , `Bearer ${adminToken}`)
            .send({
                descripcion: "Descripcion sin título ",
            });

            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toBe('El título es obligatorio');
        });
    });
    // prueba get
    describe('GET /api/bitacora', () => {
        it('deberia obtener todas las entradas de la bitácora', async () => {
            const res = await request(app)
            .get('/api/bitacora')
            .set('Authorization', `Bearer ${adminToken}`);
        });
    });

    //prueba actualizar
    describe('PUT /api/bitacora/:id', () => {
        it('deberia actualizar una entrada existente', async () => {
            const res = await request(app)
            .put(`/api/bitacora/${entradaId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                titulo: "Titulo Actualizado",
                descripcion: "Descripcion Actualizada",
            });

            expect(res.statusCode).toEqual(200);
            expect(res.body.titulo).toBe("Título Actualizado");
            expect(res.body.descripcion).toBe("Descripcion Actualizada");
        });
        
        it('deberia retornar 404 si la entrada no existe', async () => {
            const res = await request(app)
            .put('/api/bitacora/99999')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                titulo: "Inexistente", 
                descripcion: "Inexistente",
            });

            expect(res.statusCode).toEqual(404);
            expect(res.body.error).toBe('Entrada de bitacora no encontrada');
        });
    });

    // prueba delete
    describe('DELETE /api/bitacora/:id', () => {
        it('deberia eliminar una entrada existente', async() =>{
            const res = await request(app)
            .delete(`/api/bitacora/${entradaId}`)
            .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Entrada de bitácora eliminada');
        });

        it('deberia retornar 404 si la entrada ya fue eliminada', async () => {
            const res = await request(app)
            .elete(`/api/bitacora/${entradaId}`) // Intenta borrarla de nuevo
            .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(404);
            expect(res.body.error).toBe('Entrada de bitácora no encontrada');
        });
    });
});