const request = require('supertest');
const app = require('../../index');
const pool = require('../../models/db');

// Mockeamos la base de datos
jest.mock('../../models/db', () => ({
  query: jest.fn(),
}));

let server;

// Iniciamos y cerramos un servidor para nuestras pruebas
beforeAll((done) => {
    server = app.listen(4005, done); // Puerto para piso
});

afterAll((done) => {
    server.close(done);
});

describe('Pruebas de Integración para Endpoints de Piso', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Pruebas para CREAR uno o varios pisos ---
  describe('POST /api/pisos/agregar', () => {

    const edificioMock = {
        id: 1,
        pisos_totales: 10,
        area_bruta_por_piso: "500",
        area_comun_pct: "20"
    };
    
    it('debería agregar los pisos correctamente y devolver un 201', async () => {
      const datosNuevosPisos = {
        edificio_id: 1,
        cantidad: 2,
      };

      // Simulamos las interacciones con la BD
      pool.query
        // 1. Obtener datos del edificio
        .mockResolvedValueOnce({ rows: [edificioMock] }) 
        // 2. Contar pisos actuales (supongamos que hay 5)
        .mockResolvedValueOnce({ rows: [{ count: '5' }] })
        // 3. Inserción del primer piso nuevo
        .mockResolvedValueOnce({ rows: [{ id: 6, numero_piso: 6 }] })
        // 4. Inserción del segundo piso nuevo
        .mockResolvedValueOnce({ rows: [{ id: 7, numero_piso: 7 }] });

      const res = await request(server)
        .post('/api/pisos/agregar')
        .send(datosNuevosPisos);

      expect(res.statusCode).toEqual(201);
      expect(res.body.mensaje).toContain('Se agregaron 2 piso(s) correctamente.');
    });

    it('debería devolver un error 400 si se intenta exceder el total de pisos del edificio', async () => {
        const datosExcedidos = {
            edificio_id: 1,
            cantidad: 3,
        };

        pool.query
            // 1. Obtener datos del edificio (máximo 10 pisos)
            .mockResolvedValueOnce({ rows: [edificioMock] })
            // 2. Contar pisos actuales (supongamos que ya hay 8)
            .mockResolvedValueOnce({ rows: [{ count: '8' }] });
        
        const res = await request(server)
            .post('/api/pisos/agregar')
            .send(datosExcedidos);
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toContain('No puedes agregar 3 pisos.');
    });
  });
  it('debería devolver un error 400 si faltan datos obligatorios', async () => {
      const datosIncompletos = {
        cantidad: 5
        // Falta edificio_id
      };

      const res = await request(server)
        .post('/api/pisos/agregar')
        .send(datosIncompletos);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Faltan datos obligatorios' });
    });

    it('debería devolver un error 404 si el edificio no existe', async () => {
        const datosConEdificioInexistente = {
            edificio_id: 999, // ID que no existe
            cantidad: 2,
        };

        // Simulamos que la consulta del edificio devuelve una lista vacía
        pool.query.mockResolvedValueOnce({ rows: [] });

        const res = await request(server)
            .post('/api/pisos/agregar')
            .send(datosConEdificioInexistente);
        
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({ error: 'El edificio no existe' });
    });

  // --- Pruebas para OBTENER TODOS los pisos ---
  describe('GET /api/pisos', () => {
    
    it('debería devolver una lista de todos los pisos y un status 200', async () => {
        const listaPisosMock = [
            { id: 1, numero_piso: 1, edificio_id: 1 },
            { id: 2, numero_piso: 2, edificio_id: 1 },
            { id: 3, numero_piso: 1, edificio_id: 2 },
        ];
  
        pool.query.mockResolvedValueOnce({ rows: listaPisosMock });
  
        const res = await request(server)
          .get('/api/pisos');
  
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(listaPisosMock);
    });
  });

  // --- Pruebas para OBTENER pisos por edificio ---
  describe('GET /api/pisos/por-edificio', () => {

    it('debería devolver solo los pisos del edificio especificado', async () => {
        const pisosEdificio2 = [
            { id: 3, numero_piso: 1, edificio_id: 2 },
            { id: 4, numero_piso: 2, edificio_id: 2 },
        ];

        pool.query.mockResolvedValueOnce({ rows: pisosEdificio2 });

        const res = await request(server)
            .get('/api/pisos/por-edificio?edificio_id=2');
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(pisosEdificio2);
    });
  });
});