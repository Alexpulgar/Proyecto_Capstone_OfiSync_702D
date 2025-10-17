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
    server = app.listen(4003, done); // Puerto para gasto común
});

afterAll((done) => {
    server.close(done);
});

describe('Pruebas de Integración para Endpoints de Gasto Común', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/gasto-comun/calcular', () => {

    it('debería calcular el gasto común correctamente y devolver un 201', async () => {
      const datosGasto = {
        edificio_id: 1,
        mes: 'Octubre 2025',
        total: 100000,
        descripcion: 'Gastos mensuales'
      };

      // Simulamos las 4 interacciones con la BD
      pool.query
        // 1. Inserción del gasto común principal (devuelve el ID)
        .mockResolvedValueOnce({ rows: [{ id: 5 }] }) 
        // 2. Cálculo del área total de las oficinas
        .mockResolvedValueOnce({ rows: [{ total_area: '200' }] }) 
        // 3. Obtención de las oficinas ocupadas
        .mockResolvedValueOnce({ rows: [{ id: 10, area: '120' }, { id: 11, area: '80' }] })
        // 4. Inserciones en detalleGastoComun (no necesitamos simular cada una, solo que no fallen)
        .mockResolvedValue({ rows: [] });

      const res = await request(server)
        .post('/api/gasto-comun/calcular')
        .send(datosGasto);

      expect(res.statusCode).toEqual(201);
      expect(res.body.mensaje).toBe(' Gasto común calculado correctamente.');
      expect(res.body.gasto_por_m2).toBe("500.00"); // 100000 / 200
    });

    it('debería devolver un error 400 si faltan datos obligatorios', async () => {
      const datosIncompletos = {
        edificio_id: 1,
        mes: 'Noviembre 2025'
        // Falta el total
      };

      const res = await request(server)
        .post('/api/gasto-comun/calcular')
        .send(datosIncompletos);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Faltan datos obligatorios.' });
    });

    it('debería devolver un error 400 si el edificio no tiene oficinas con área válida', async () => {
        const datosGasto = {
            edificio_id: 2,
            mes: 'Diciembre 2025',
            total: 50000
        };

        // Simulamos las primeras 2 interacciones con la BD
        pool.query
            // 1. Inserción del gasto común
            .mockResolvedValueOnce({ rows: [{ id: 6 }] })
            // 2. El edificio no tiene área o es 0
            .mockResolvedValueOnce({ rows: [{ total_area: '0' }] });

        const res = await request(server)
            .post('/api/gasto-comun/calcular')
            .send(datosGasto);
        
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({ error: 'El edificio no tiene oficinas registradas o las áreas son inválidas.' });
    });
    it('debería devolver un error 400 si el edificio no tiene oficinas ocupadas', async () => {
        const datosGasto = {
            edificio_id: 3,
            mes: 'Enero 2026',
            total: 120000
        };

        pool.query
            // 1. Inserción del gasto común
            .mockResolvedValueOnce({ rows: [{ id: 7 }] })
            // 2. Cálculo del área total (el edificio tiene área)
            .mockResolvedValueOnce({ rows: [{ total_area: '300' }] })
            // 3. Obtención de oficinas ocupadas -> Devuelve una lista vacía
            .mockResolvedValueOnce({ rows: [] });

        const res = await request(server)
            .post('/api/gasto-comun/calcular')
            .send(datosGasto);
        
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({ error: 'No hay oficinas ocupadas en este edificio.' });
    });
  });
});