const request = require('supertest');
let app;
let pool;
let adminToken;
let entradaId;

jest.setTimeout(20000);

describe('Pruebas de Integración para Endpoints de Bitácora', () => {
  beforeAll(async () => {
    jest.resetModules();

    jest.doMock('../../middlewares/authMiddleware', () => (req, res, next) => {
      req.user = {
        id: 999,
        nombre_usuario: 'Test Admin',
        rol: 'administrador',
      };
      next();
    });

    jest.doMock(
      '../../middlewares/checkRoleMiddleware',
      () => (roles) => (req, res, next) => {
        next();
      }
    );

    app = require('../../index');
    const dbPool = require('../../models/db');
    pool = dbPool;

    const jwt = require('jsonwebtoken');

    const adminUser = {
      id: 999,
      nombre_usuario: 'Test Admin',
      rol: 'administrador',
    };
    adminToken = jwt.sign(adminUser, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    try {
      const insertUserQuery = `
        INSERT INTO usuarios (id, nombre_usuario, rol, contrasena_hash) 
        VALUES (999, 'Test Admin', 'administrador', 'dummy_hash_para_test') 
        ON CONFLICT (id) DO NOTHING
      `;
      await pool.query(insertUserQuery);

      // Limpiar entradas de bitácora
      await pool.query('DELETE FROM bitacora WHERE autor_id = 999');
    } catch (err) {
      console.error('Error limpiando la BD antes del test:', err);
    }
  });

  afterAll(async () => {
    try {
      await pool.query('DELETE FROM bitacora WHERE autor_id = 999');
      await pool.query('DELETE FROM usuarios WHERE id = 999');
    } catch (err) {
      console.error('Error limpiando la BD después del test:', err);
    }

    if (pool) {
      await pool.end();
    }
  });

  describe('POST /api/bitacora', () => {
    it('debería crear una nueva entrada de bitácora', async () => {
      const res = await request(app)
        .post('/api/bitacora')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          titulo: 'Test de Integración Bitácora',
          descripcion: 'Descripción para el test de integración',
        });

      // ¡Esto ahora debe dar 201!
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.titulo).toBe('Test de Integración Bitácora');
      expect(res.body.autor_nombre).toBe('Test Admin');

      entradaId = res.body.id;
    });

    it('debería retornar 400 si el título falta (validación Joi)', async () => {
      const res = await request(app)
        .post('/api/bitacora')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          descripcion: 'Descripción sin título',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBe('El título es obligatorio');
    });
  });
});