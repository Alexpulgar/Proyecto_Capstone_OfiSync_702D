const model = require('../../models/reservationsModel.js');
const pool = require('../../models/db.js');
const request = require('supertest');
const express = require('express');
const reservationsRoutes = require('../../routes/reservationsRoutes.js');
const reservationsController = require('../../controllers/reservationsController.js');

jest.mock('../../models/reservationsModel.js');
jest.mock('../../models/db.js', () => ({
  query: jest.fn(),
}));
jest.mock('../../controllers/reservationsController.js');

const OriginalDate = global.Date;
const MOCK_DATE = '2025-10-15T10:00:00.000Z';
jest.spyOn(global, 'Date').mockImplementation((...args) => {
  if (args.length === 0) {
    return new OriginalDate(MOCK_DATE);
  }
  return new OriginalDate(...args);
});


describe('Pruebas Lógicas para reservationsController', () => {
  let req;
  let res;

  let postReservation; 
  beforeAll(() => {
    jest.unmock('../../controllers/reservationsController.js');
    const realController = jest.requireActual('../../controllers/reservationsController.js');
    postReservation = realController.postReservation;
  });

  afterAll(() => {
    jest.mock('../../controllers/reservationsController.js');
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mock('../../models/reservationsModel.js'); 
    req = {
      body: {},
      file: null,
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });
  
  describe('Lógica de postReservation', () => {
    it('debería retornar error 400 si la fecha de reserva es en el pasado', async () => {
      req.body = {
        service_id: 1,
        date: '2025-10-14',
        start_time: '09:00',
        end_time: '10:00',
      };
      pool.query.mockResolvedValue({ rows: [{ type: 'room' }] });

      await postReservation(req, res); 

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'No puedes reservar un horario que ya pasó.' });
    });

    it('debería retornar error 400 si la hora de fin es anterior a la de inicio', async () => {
      req.body = {
        service_id: 1,
        date: '2025-10-20',
        start_time: '14:00',
        end_time: '13:00',
      };
      pool.query.mockResolvedValue({ rows: [{ type: 'room' }] });

      await postReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'La hora de término debe ser posterior a la hora de inicio.' });
    });

    it('debería retornar error 409 si el horario de la sala ya está ocupado', async () => {
      req.body = {
        service_id: 1,
        date: '2025-10-20',
        start_time: '15:00',
        end_time: '16:00',
      };
      pool.query
        .mockResolvedValueOnce({ rows: [{ type: 'room' }] })
        .mockResolvedValueOnce({ rows: [{ id: 99 }] });

      await postReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'El horario seleccionado ya está reservado.' });
    });

    it('debería retornar error 400 si no se provee una cantidad', async () => {
      req.body = { service_id: 2, size: 'carta' };
      req.file = { filename: 'test.pdf' };
      pool.query.mockResolvedValue({ rows: [{ type: 'print' }] });

      await postReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Por favor ingresa una cantidad válida (mayor a 0).' });
    });

    it('debería retornar error 400 si no se adjunta un archivo', async () => {
      req.body = { service_id: 2, quantity: 1, size: 'carta' };
      req.file = null;
      pool.query.mockResolvedValue({ rows: [{ type: 'scan' }] });

      await postReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Debes adjuntar un archivo antes de reservar.' });
    });

    it('debería llamar a createReservation y retornar 201 si la validación es exitosa', async () => {
      req.body = {
        user_id: 1,
        service_id: 1,
        date: '2025-12-01',
        start_time: '14:00',
        end_time: '15:00',
      };
      const mockReservation = { id: 10, ...req.body };

      pool.query
        .mockResolvedValueOnce({ rows: [{ type: 'room' }] })
        .mockResolvedValueOnce({ rows: [] }); 
      model.createReservation.mockResolvedValue(mockReservation); 

      await postReservation(req, res);

      expect(model.createReservation).toHaveBeenCalledWith({ ...req.body, file_url: null });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockReservation);
    });
  });
});

const app = express();
app.use(express.json());
app.use('/api/reservations', reservationsRoutes);

describe('Pruebas de Integración para las rutas de Reservaciones', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  // Pruebas para GET /services
  describe('GET /api/reservations/services', () => {
    it('debería retornar 200 y una lista de servicios', async () => {
      const mockServices = [{ id: 1, name: 'Servicio de Prueba' }];
      reservationsController.getAllServices.mockImplementation((req, res) => {
        res.json(mockServices);
      });

      const response = await request(app).get('/api/reservations/services');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockServices);
    });
  });

  // Pruebas para GET /user/:id
  describe('GET /api/reservations/user/:id', () => {
    it('debería retornar 200 y las reservas del usuario', async () => {
        const userId = 1;
        const mockReservations = [{ id: 1, user_id: userId }];
        reservationsController.getUserRes.mockImplementation((req, res) => {
            res.json(mockReservations);
        });

        const response = await request(app).get(`/api/reservations/user/${userId}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockReservations);
    });
  });

  // Pruebas para PUT /:id/cancel
  describe('PUT /api/reservations/:id/cancel', () => {
    it('debería retornar 200 y la reserva cancelada', async () => {
        const reservationId = 1;
        const mockCanceled = { id: reservationId, status: 'cancelada' };
        reservationsController.cancelRes.mockImplementation((req, res) => {
            res.json(mockCanceled);
        });

        const response = await request(app).put(`/api/reservations/${reservationId}/cancel`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCanceled);
    });
  });

  // Pruebas para POST /
  describe('POST /api/reservations', () => {
    it('debería retornar 201 y la nueva reserva creada', async () => {
      const newReservation = { user_id: 1, service_id: 2, quantity: 10, size: 'oficio' };
      const mockCreated = { id: 1, ...newReservation };

      reservationsController.postReservation.mockImplementation((req, res) => {
        res.status(201).json(mockCreated);
      });

      const response = await request(app)
        .post('/api/reservations')
        .send(newReservation);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockCreated);
    });
  });
});


describe('Pruebas para reservationsModel', () => {
  
  let getServices, createReservation, getUserReservations, cancelReservation;
  beforeAll(() => {
    jest.unmock('../../models/reservationsModel.js');
    const realModel = jest.requireActual('../../models/reservationsModel.js');
    getServices = realModel.getServices;
    createReservation = realModel.createReservation;
    getUserReservations = realModel.getUserReservations;
    cancelReservation = realModel.cancelReservation;
  });

  afterAll(() => {
    jest.mock('../../models/reservationsModel.js');
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Pruebas para getServices
  describe('getServices', () => {
    it('debería retornar una lista de servicios', async () => {
      const mockServices = [{ id: 1, name: 'Sala de Reuniones' }];
      pool.query.mockResolvedValue({ rows: mockServices }); 

      // Esto ahora usa la variable 'getServices' real
      const services = await getServices(); 
      expect(services).toEqual(mockServices);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM services ORDER BY id');
    });
  });

  // Pruebas para createReservation
  describe('createReservation', () => {
    it('debería crear una reserva y retornar los datos completos', async () => {
      const reservationData = {
        user_id: 1,
        service_id: 1,
        quantity: 2,
        size: 'carta',
        file_url: '/uploads/file.pdf',
        date: '2025-10-15',
        start_time: '10:00',
        end_time: '12:00',
      };

      const mockService = { valor_base: 5000 };
      const mockCreatedReservation = { ...reservationData, id: 1, status: 'pendiente', valor_total: 10000 };

      pool.query
        .mockResolvedValueOnce({ rows: [mockService] })
        .mockResolvedValueOnce({ rows: [mockCreatedReservation] });

      const newReservation = await createReservation(reservationData);

      expect(newReservation).toEqual({
        ...mockCreatedReservation,
        valor_base: 5000,
        cantidadNum: 2,
        valor_total: 10000
      });
      expect(pool.query).toHaveBeenCalledTimes(2);
    });
  });

  // Pruebas para getUserReservations
  describe('getUserReservations', () => {
    it('debería retornar las reservas de un usuario específico', async () => {
      const userId = 1;
      const mockReservations = [{ id: 1, service_name: 'Impresión' }];
      pool.query.mockResolvedValue({ rows: mockReservations });

      const reservations = await getUserReservations(userId);
      expect(reservations).toEqual(mockReservations);
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [userId]);
    });
  });

  // Pruebas para cancelReservation
  describe('cancelReservation', () => {
    it('debería cambiar el estado de una reserva a "cancelada"', async () => {
      const reservationId = 1;
      const mockCanceled = { id: reservationId, status: 'cancelada' };
      pool.query.mockResolvedValue({ rows: [mockCanceled] });

      const reservation = await cancelReservation(reservationId);
      expect(reservation.status).toBe('cancelada');
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [reservationId]);
    });
  });
});