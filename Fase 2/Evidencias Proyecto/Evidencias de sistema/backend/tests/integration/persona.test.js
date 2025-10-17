const request = require('supertest');
const app = require('../../index'); // Importamos la app de Express, que ya no inicia el servidor
const pool = require('../../models/db');

// Mockeamos la base de datos para aislar las pruebas de la base de datos real
jest.mock('../../models/db', () => ({
  query: jest.fn(),
}));

// Creamos una variable para nuestro servidor de prueba
let server;

// Antes de que comiencen todas las pruebas en este archivo, levantamos un servidor
beforeAll((done) => {
    // Usamos un puerto diferente (ej. 4001) para evitar conflictos con el servidor de desarrollo
    server = app.listen(4001, done);
});

// Después de que terminen todas las pruebas en este archivo, cerramos el servidor
// Esto es crucial para que Jest pueda terminar el proceso sin advertencias
afterAll((done) => {
    server.close(done);
});


describe('Pruebas de Integración para Endpoints de Persona', () => {

  // Limpiamos los mocks después de cada prueba para asegurar que una prueba no afecte a la siguiente
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/personas/agregar', () => {
    
    it('debería crear una nueva persona y devolver un 201', async () => {
      const nuevaPersona = {
        rut: '11222333-4',
        nombre: 'Jane Doe',
        correo: 'jane.doe@example.com',
        telefono: '123456789'
      };

      // Simulamos la primera llamada a la BD (para verificar si el RUT existe) -> No encuentra nada
      pool.query.mockResolvedValueOnce({ rows: [] }); 
      // Simulamos la segunda llamada a la BD (la inserción) -> Devuelve la persona creada
      pool.query.mockResolvedValueOnce({ rows: [nuevaPersona] });

      const res = await request(server) // Usamos el servidor de prueba
        .post('/api/personas/agregar')
        .send(nuevaPersona);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(nuevaPersona);
    });

    it('debería devolver un error 400 si faltan datos', async () => {
      const personaIncompleta = {
        nombre: 'John Doe'
      };

      const res = await request(server)
        .post('/api/personas/agregar')
        .send(personaIncompleta);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Faltan datos obligatorios' });
    });

    it('debería devolver un error 400 si el RUT ya existe', async () => {
        const personaExistente = {
            rut: '11111111-1',
            nombre: 'Persona Repetida',
            correo: 'repetido@example.com',
            telefono: '999888777'
        };

        // Simulamos que la primera llamada a la BD SÍ encuentra una persona con ese RUT
        pool.query.mockResolvedValueOnce({ rows: [personaExistente] });

        const res = await request(server)
            .post('/api/personas/agregar')
            .send(personaExistente);
        
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({ error: 'El rut ingresado ya existe en el sistema..' });
    });
  });
});

describe('GET /api/personas', () => {

    it('debería devolver una lista de todas las personas y un status 200', async () => {
      const listaDePersonasMock = [
        { id: 1, nombre: 'Juan Perez' },
        { id: 2, nombre: 'Ana López' },
      ];

      // Simulamos la respuesta de la base de datos cuando se piden todas las personas
      pool.query.mockResolvedValueOnce({ rows: listaDePersonasMock });

      const res = await request(server)
        .get('/api/personas');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(listaDePersonasMock);
      // Verificamos que se llamó a la función de la base de datos
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('debería devolver una lista vacía si no hay personas en la base de datos', async () => {
        // Simulamos una respuesta de la BD sin personas
        pool.query.mockResolvedValueOnce({ rows: [] });
  
        const res = await request(server)
          .get('/api/personas');
  
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([]); // El resultado debe ser un array vacío
    });

  });