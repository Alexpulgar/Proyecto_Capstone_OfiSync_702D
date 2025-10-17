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
    server = app.listen(4004, done); // Puerto para oficina
});

afterAll((done) => {
    server.close(done);
});

describe('Pruebas de Integración para Endpoints de Oficina', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Pruebas para CREAR una oficina ---
  describe('POST /api/oficinas/agregar', () => {
    it('debería devolver un error 400 si faltan datos obligatorios', async () => {
      const oficinaIncompleta = {
        codigo: '501',
        area: 120
        // Faltan piso_id y edificio_id
      };

      const res = await request(server)
        .post('/api/oficinas/agregar')
        .send(oficinaIncompleta);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Faltan datos obligatorios' });
    });
    
    it('debería crear una nueva oficina y devolver un 201', async () => {
      const nuevaOficina = {
        codigo: '301',
        piso_id: 5,
        area: 80,
        estado: 'libre',
        persona_id: null,
        edificio_id: 2
      };

      // Simulamos que el código no existe en el edificio
      pool.query.mockResolvedValueOnce({ rows: [] }); 
      // Simulamos la inserción
      pool.query.mockResolvedValueOnce({ rows: [nuevaOficina] });

      const res = await request(server)
        .post('/api/oficinas/agregar')
        .send(nuevaOficina);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(nuevaOficina);
    });

    it('debería devolver un error 400 si el código de la oficina ya existe en el edificio', async () => {
        const oficinaExistente = {
            codigo: '101',
            piso_id: 1,
            area: 50,
            edificio_id: 1
        };

        // Simulamos que la BD SÍ encuentra una oficina con ese código en el edificio
        pool.query.mockResolvedValueOnce({ rows: [oficinaExistente] });

        const res = await request(server)
            .post('/api/oficinas/agregar')
            .send(oficinaExistente);
        
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({ error: 'Ya existe una oficina con ese código en este edificio' });
    });

    it('debería devolver un error 400 si el estado es "ocupada" pero no se provee un arrendatario', async () => {
        const oficinaInvalida = {
            codigo: '404',
            piso_id: 4,
            area: 100,
            estado: 'ocupada',
            persona_id: null,
            edificio_id: 3
        };

        const res = await request(server)
            .post('/api/oficinas/agregar')
            .send(oficinaInvalida);
        
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({ error: 'Debe asignar un arrendatario cuando la oficina está ocupada.' });
    });
  });

  // --- Pruebas para OBTENER TODAS las oficinas ---
  describe('GET /api/oficinas', () => {
    
    it('debería devolver una lista de todas las oficinas y un status 200', async () => {
        const listaOficinasMock = [
            { edificio: 'Torre Central', numero_piso: 1, oficina: '101', area: 50, estado: 'ocupada', arrendatario: 'Juan Perez' },
            { edificio: 'Torre Sur', numero_piso: 5, oficina: '502', area: 150, estado: 'libre', arrendatario: null },
        ];
  
        pool.query.mockResolvedValueOnce({ rows: listaOficinasMock });
  
        const res = await request(server)
          .get('/api/oficinas');
  
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(listaOficinasMock);
    });
  });

  // --- Pruebas para BUSCAR oficinas ---
  describe('GET /api/oficinas/buscar', () => {

    it('debería devolver las oficinas filtradas por estado', async () => {
        const oficinasLibres = [{ oficina: '202', estado: 'libre' }];

        pool.query.mockResolvedValueOnce({ rows: oficinasLibres });

        const res = await request(server)
            .get('/api/oficinas/buscar?estado=libre');
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(oficinasLibres);
    });

    it('debería devolver las oficinas filtradas por múltiples parámetros', async () => {
        const oficinasFiltradas = [{ oficina: '303', piso: 3, estado: 'ocupada' }];

        pool.query.mockResolvedValueOnce({ rows: oficinasFiltradas });

        const res = await request(server)
            .get('/api/oficinas/buscar?piso=3&estado=ocupada');
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(oficinasFiltradas);
    });
  });
});