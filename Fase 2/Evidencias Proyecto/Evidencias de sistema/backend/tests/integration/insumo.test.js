const request = require('supertest');
const app = require('../../index'); // Importa la app real
const pool = require('../../models/db'); // Importa el mock

// Mockeamos la base de datos a nivel global para este test
jest.mock('../../models/db', () => ({
  query: jest.fn(),
}));

let server;

beforeAll((done) => {
  server = app.listen(4005, done); // Usar un puerto diferente
});

afterAll((done) => {
  server.close(done);
});

describe('Pruebas de Integración para Endpoints de Insumo (con Mocks)', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Limpia mocks entre pruebas
  });

  // --- Pruebas GET ---
  describe('GET /api/insumos', () => {
    it('debería obtener todos los insumos', async () => {
      const mockInsumos = [{ id: 1, nombre: 'Resma' }];
      pool.query.mockResolvedValueOnce({ rows: mockInsumos });

      const res = await request(server).get('/api/insumos');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockInsumos);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM insumo ORDER BY nombre ASC' 
      );
    });
  });

  // --- Pruebas POST ---
  describe('POST /api/insumos', () => {
    it('debería crear un nuevo insumo y devolver un 201', async () => {
      const nuevoInsumo = {
        nombre: 'Toner HP 415A',
        categoria: 'Impresión',
        stock: 10,
        stock_minimo: 2,
        estado: 'Activo',
      };
      const insumoCreado = { id: 1, ...nuevoInsumo };

      pool.query.mockResolvedValueOnce({ rows: [insumoCreado] });

      const res = await request(server).post('/api/insumos').send(nuevoInsumo);

      expect(res.statusCode).toEqual(201); // 201 = Creado
      expect(res.body).toEqual(insumoCreado);
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('debería devolver un error 400 si faltan datos (validación Joi)', async () => {
      const insumoIncompleto = {
        nombre: 'Incompleto',
        stock: 10,
      };

      const res = await request(server)
        .post('/api/insumos')
        .send(insumoIncompleto);

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toContain('La categoría es obligatoria');
      expect(res.body.errors).toContain('El stock mínimo es obligatorio');
      expect(pool.query).not.toHaveBeenCalled();
    });
  });

  // --- Pruebas PUT ---
  describe('PUT /api/insumos/:id', () => {
    it('debería actualizar un insumo y devolver 200', async () => {
      const datosActualizados = {
        nombre: 'Toner Actualizado',
        categoria: 'Impresión',
        stock: 20,
        stock_minimo: 5,
        estado: 'Activo',
      };
      const insumoActualizado = { id: 1, ...datosActualizados };

      // 1. Check de existencia
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, nombre: 'Viejo' }],
      });
      // 2. Query de UPDATE
      pool.query.mockResolvedValueOnce({ rows: [insumoActualizado] });

      const res = await request(server)
        .put('/api/insumos/1')
        .send(datosActualizados);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(insumoActualizado);
      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    it('debería devolver 404 si el insumo a actualizar no existe', async () => {
      const datosActualizados = {
        nombre: 'Toner Fantasma',
        categoria: 'Impresión',
        stock: 20,
        stock_minimo: 5,
        estado: 'Activo',
      };

      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(server)
        .put('/api/insumos/999')
        .send(datosActualizados);

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toEqual('Insumo no encontrado');
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });

  // --- Pruebas DELETE ---
  describe('DELETE /api/insumos/:id', () => {
    it('debería eliminar un insumo y devolver 200', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const res = await request(server).delete('/api/insumos/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Insumo eliminado');
      
      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM insumo WHERE id = $1 RETURNING *', 
        ['1'] 
      );
    });

    it('debería devolver 404 si el insumo a eliminar no existe', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(server).delete('/api/insumos/999');

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toEqual('Insumo no encontrado');
    });
  });
});