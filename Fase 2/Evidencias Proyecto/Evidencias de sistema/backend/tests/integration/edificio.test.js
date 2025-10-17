const request = require('supertest');
const app = require('../../index'); // Importamos la app de Express
const pool = require('../../models/db');

// Mockeamos la base de datos para no usar la real
jest.mock('../../models/db', () => ({
  query: jest.fn(),
}));

let server;

// Antes de todas las pruebas, iniciamos el servidor
beforeAll((done) => {
    server = app.listen(4002, done); // Usamos otro puerto para las pruebas de edificio
});

// Después de todas las pruebas, cerramos el servidor
afterAll((done) => {
    server.close(done);
});

describe('Pruebas de Integración para Endpoints de Edificio', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Pruebas para CREAR un edificio ---
  describe('POST /api/edificios/agregar', () => {
    
    it('debería crear un nuevo edificio y devolver un 201', async () => {
      const nuevoEdificio = {
        nombre: 'Torre Nueva',
        pisos_totales: 25,
        area_bruta_por_piso: 500,
        area_comun_pct: 15
      };

      // Simulamos que el nombre no existe
      pool.query.mockResolvedValueOnce({ rows: [] }); 
      // Simulamos la inserción
      pool.query.mockResolvedValueOnce({ rows: [nuevoEdificio] });

      const res = await request(server)
        .post('/api/edificios/agregar')
        .send(nuevoEdificio);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(nuevoEdificio);
    });

    it('debería devolver un error 400 si un edificio con el mismo nombre ya existe', async () => {
        const edificioExistente = {
            nombre: 'Torre Existente',
            pisos_totales: 10,
            area_bruta_por_piso: 300,
            area_comun_pct: 10
        };

        // Simulamos que la BD SÍ encuentra un edificio con ese nombre
        pool.query.mockResolvedValueOnce({ rows: [edificioExistente] });

        const res = await request(server)
            .post('/api/edificios/agregar')
            .send(edificioExistente);
        
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({ error: 'Ya existe un edificio con ese nombre' });
    });
  });
  it('debería devolver un error 400 si faltan datos obligatorios', async () => {
      const edificioIncompleto = {
        nombre: 'Edificio Incompleto'
        // Faltan pisos_totales, area_bruta_por_piso, etc.
      };

      const res = await request(server)
        .post('/api/edificios/agregar')
        .send(edificioIncompleto);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Faltan datos obligatorios' });
    });

  // --- Pruebas para OBTENER los edificios ---
  describe('GET /api/edificios', () => {
    
    it('debería devolver una lista de edificios y un status 200', async () => {
        const listaEdificiosMock = [
            { id: 1, nombre: 'Edificio Central', pisos_totales: 20 },
            { id: 2, nombre: 'Torre Sur', pisos_totales: 15 },
        ];
  
        // Simulamos la respuesta de la BD
        pool.query.mockResolvedValueOnce({ rows: listaEdificiosMock });
  
        const res = await request(server)
          .get('/api/edificios');
  
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(listaEdificiosMock);
    });
  });
});