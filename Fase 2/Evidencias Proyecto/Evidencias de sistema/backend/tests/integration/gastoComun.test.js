const request = require("supertest");
const app = require("../../index");
const pool = require("../../models/db");

jest.mock("../../models/db", () => ({
  query: jest.fn(),
  end: jest.fn(),
}));

beforeAll(async () => {});

afterAll(async () => {
  try {
  } catch (error) {
    console.error("Error limpiando datos de prueba:", error);
  } finally {
    await pool.end();
  }
});

describe("Pruebas de Integración para Endpoints de Gasto Común", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/gasto-comun/calcular", () => {
    it("debería calcular el gasto común correctamente y devolver un 201", async () => {
      const datosGasto = {
        edificio_id: 1,
        mes: "Octubre de 2025",
        total: 100000,
        descripcion: "Gastos mensuales",
        luz: 50000,
        agua: 30000,
        mantencion: 20000,
      };

      pool.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 5 }] })
        .mockResolvedValueOnce({ rows: [{ total_area: "200" }] })
        .mockResolvedValueOnce({
          rows: [
            { id: 10, area: "120" },
            { id: 11, area: "80" },
          ],
        })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValue({ rows: [] });

      const res = await request(app)
        .post("/api/gasto-comun/calcular")
        .send(datosGasto);

      expect(res.statusCode).toEqual(201);
      expect(res.body.mensaje).toContain("Gasto común calculado correctamente");
      expect(res.body.gasto_por_m2).toBe("500.00");
    });

    it("debería devolver un error 400 si faltan datos obligatorios", async () => {
      const datosIncompletos = {
        edificio_id: 1,
        mes: "Noviembre de 2025",
      };

      const res = await request(app)
        .post("/api/gasto-comun/calcular")
        .send(datosIncompletos);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: "Faltan datos obligatorios." });
    });

    it("debería devolver un error 409 si el gasto ya existe", async () => {
      const datosGasto = {
        edificio_id: 1,
        mes: "Noviembre de 2025",
        total: 100000,
        luz: 50000,
        agua: 30000,
        mantencion: 20000,
      };

      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const res = await request(app)
        .post("/api/gasto-comun/calcular")
        .send(datosGasto);

      expect(res.statusCode).toEqual(409);
      expect(res.body).toEqual({
        error: "Ya se ha registrado un gasto común para este edificio y mes.",
      });
    });

    it("debería devolver un error 400 si el edificio no tiene oficinas con área válida", async () => {
      const datosGasto = {
        edificio_id: 2,
        mes: "Diciembre de 2025",
        total: 50000,
        luz: 25000,
        agua: 15000,
        mantencion: 10000,
      };

      pool.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 6 }] })
        .mockResolvedValueOnce({ rows: [{ total_area: "0" }] });

      const res = await request(app)
        .post("/api/gasto-comun/calcular")
        .send(datosGasto);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({
        error:
          "El edificio no tiene oficinas registradas o las áreas son inválidas.",
      });
    });

    it("debería devolver un error 400 si el edificio no tiene oficinas ocupadas", async () => {
      const datosGasto = {
        edificio_id: 3,
        mes: "Enero de 2026",
        total: 120000,
        luz: 60000,
        agua: 40000,
        mantencion: 20000,
      };

      pool.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 7 }] })
        .mockResolvedValueOnce({ rows: [{ total_area: "300" }] })
        .mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post("/api/gasto-comun/calcular")
        .send(datosGasto);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({
        error: "No hay oficinas ocupadas en este edificio.",
      });
    });
  });
});
