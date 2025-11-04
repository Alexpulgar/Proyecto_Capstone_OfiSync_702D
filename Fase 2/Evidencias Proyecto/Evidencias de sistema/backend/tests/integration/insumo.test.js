const request = require('supertest');
const app = require('../../index'); 
const pool = require('../../models/db');

//  Mockeamos la base de datos 
jest.mock('../../models/db', () => ({
  query: jest.fn(),
}));

let server;

// Levantamos el servidor en un puerto de prueba 
beforeAll((done) => {
  // Usamos un puerto diferente para evitar conflictos (ej. 4003)
  server = app.listen(4006, done); 
});

// --- 3. Cerramos el servidor al final ---
afterAll((done) => {
  server.close(done);
});

describe('Pruebas de Integración para Endpoints de Insumo (con Mocks)', () => {

  // Limpiamos los mocks después de CADA test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Pruebas para OBTENER todos los insumos (obtenerInsumos) ---
  describe('GET /api/insumos', () => {
    
    it('debería devolver una lista de insumos y un status 200', async () => {
      const listaInsumosMock = [
        { id: 1, nombre: 'Resma Papel', stock: 100, stock_minimo: 20 },
        { id: 2, nombre: 'Toner XYZ', stock: 0, stock_minimo: 5, estado: 'inactivo' },
      ];

      // Simulamos la respuesta de la BD (1 sola consulta)
      pool.query.mockResolvedValueOnce({ rows: listaInsumosMock });

      const res = await request(server).get('/api/insumos'); 

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(listaInsumosMock);
      expect(pool.query).toHaveBeenCalledTimes(1); // Verificamos que se llamó a la BD 1 vez
    });
  });

  // Pruebas para CREAR un insumo (agregarInsumo) ---
  describe('POST /api/insumos', () => {
    
    it('debería crear un nuevo insumo y devolver un 201', async () => {
      const nuevoInsumo = { 
        nombre: 'Lápices HB', 
        categoria: 'Librería', 
        stock: 50, 
        stock_minimo: 10
      };
      
      const insumoCreado = {
        id: 1,
        ...nuevoInsumo,
        estado: 'activo' 
      };

      // Simulamos las 2 consultas de tu controlador 'agregarInsumo':
      // "Verificar duplicado" (devuelve array vacío, o sea, no existe)
      pool.query.mockResolvedValueOnce({ rows: [] }); 
      // "INSERT ... RETURNING *" (devuelve el objeto creado)
      pool.query.mockResolvedValueOnce({ rows: [insumoCreado] });

      const res = await request(server)
        .post('/api/insumos') 
        .send(nuevoInsumo);

      expect(res.statusCode).toEqual(201); // 201 = Creado
      expect(res.body).toEqual(insumoCreado);
      expect(pool.query).toHaveBeenCalledTimes(2); // Verificamos 2 llamadas a la BD
    });

    it('debería devolver un error 400 si el insumo ya existe (duplicado)', async () => {
      const insumoExistente = { 
        nombre: 'Lápices HB', 
        categoria: 'Librería', 
        stock: 50, 
        stock_minimo: 10
      };
      
      // Simulamos la 1ra consulta (verificar duplicado)
      // Esta vez, SÍ encontramos uno.
      pool.query.mockResolvedValueOnce({ rows: [insumoExistente] });

      const res = await request(server)
        .post('/api/insumos')
        .send(insumoExistente);
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual('Ya existe un insumo con ese nombre en la misma categoría');
      expect(pool.query).toHaveBeenCalledTimes(1); // Solo hace 1 consulta y falla
    });

    it('debería devolver un error 400 si faltan datos (validación del controller)', async () => {
      const insumoIncompleto = {
        nombre: 'Insumo sin stock'
        // Faltan stock y stock_minimo
      };

      // No simulamos 'pool.query' porque la validación debe fallar ANTES
      
      const res = await request(server)
        .post('/api/insumos')
        .send(insumoIncompleto);

      expect(res.statusCode).toEqual(400);
      // Este es el error de tu 'insumoController.js'
      expect(res.body.error).toEqual('El stock debe ser numerico'); 
      expect(pool.query).not.toHaveBeenCalled(); // La BD no debe ser consultada
    });
  });
  
  // --- Pruebas para ACTUALIZAR un insumo (actualizarInsumo) ---
  describe('PUT /api/insumos/:id', () => {
    
    it('debería actualizar un insumo y reactivarlo (lógica de estado)', async () => {
      const id = 1;
      const insumoEnDB = {
        id: 1,
        nombre: 'Toner Viejo',
        stock: 0, // Estaba inactivo
        stock_minimo: 1,
        estado: 'inactivo'
      };
      const datosActualizados = {
        stock: 50, // Le agregamos stock
        nombre: 'Toner Nuevo'
      };
      const insumoActualizado = {
        ...insumoEnDB,
        ...datosActualizados,
        estado: 'activo' // El controlador debe cambiar esto
      };

      // Simulamos las 3 consultas de 'actualizarInsumo':
      // 1. "Verificar existencia" (devuelve el insumo inactivo)
      pool.query.mockResolvedValueOnce({ rows: [insumoEnDB] });
      // 2. "Validar duplicado nombre+categoría" (devuelve vacío)
      pool.query.mockResolvedValueOnce({ rows: [] });
      // 3. "UPDATE ... RETURNING *" (devuelve el insumo ya actualizado)
      pool.query.mockResolvedValueOnce({ rows: [insumoActualizado] });

      const res = await request(server)
        .put(`/api/insumos/${id}`)
        .send(datosActualizados);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(insumoActualizado);
      expect(res.body.estado).toBe('activo'); // Verificamos la lógica de reactivación
      expect(pool.query).toHaveBeenCalledTimes(3);
    });
  });

});