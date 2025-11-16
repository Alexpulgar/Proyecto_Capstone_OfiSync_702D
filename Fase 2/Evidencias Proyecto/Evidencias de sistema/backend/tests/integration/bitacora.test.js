const request = require("supertest");
const app = require("../../index");
const pool = require("../../models/db");
const jwt = require("jsonwebtoken");
const { crearEntrada } = require("../../controllers/bitacoraController");

jest.mock("../../middlewares/authMiddleware", () => (req, res, next) => {
  req.user = {
    id: 999,
    nombre_usuario: "Test Admin",
    rol: "administrador",
  };
  next();
});

jest.mock(
  "../../middlewares/checkRoleMiddleware",
  () => (roles) => (req, res, next) => {
    next();
  }
);

let adminToken;
let entradaId;
let testPersonaId;

beforeAll(async () => {
  await pool.query("DELETE FROM bitacora where autor_id = 999");
  await pool.query("DELETE FROM usuarios WHERE id = 999");
  await pool.query("DELETE FROM persona WHERE correo = 'admin@test.com'");

  const personaRes = await pool.query(`
        INSERT INTO persona (rut, nombre, correo, telefono) 
        VALUES ('1-9', 'Test', 'admin@test.com', '1234567')
        RETURNING id
    `);
  testPersonaId = personaRes.rows[0].id;

  await pool.query(
    `
        INSERT INTO usuarios (id, nombre_usuario, contrasena_hash, rol, persona_id) 
        VALUES (999, 'Test Admin', 'testpass', 'administrador', $1)
    `,
    [testPersonaId]
  );

  const adminUser = {
    id: 999,
    nombre_usuario: "Test Admin",
    email: "admin@test.com",
    rol: "administrador",
  };

  adminToken = jwt.sign(adminUser, process.env.JWT_SECRET, {
    expiresIn: "1hr",
  });
});

afterAll(async () => {
  try {
    await pool.query("DELETE FROM bitacora where autor_id = 999");
    await pool.query("DELETE FROM usuarios WHERE id = 999");

    if (testPersonaId) {
      await pool.query("DELETE FROM persona WHERE id = $1", [testPersonaId]);
    }
  } catch (error) {
    console.error("Error durante la limpieza (afterAll):", error);
  } finally {
    await pool.end();
  }
});

describe("Prueba de integracios para Endpoints de Bitacora", () => {
  describe("POST /api/bitacora", () => {
    it("deberia crear una nueva entrada de bitacora", async () => {
      const res = await request(app)
        .post("/api/bitacora")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          titulo: "Test de Integracion",
          descripcion: "Descripcion para el test de integracion",
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.titulo).toBe("Test de Integracion");

      expect(res.body.autor_nombre).toBe("Test Admin");

      entradaId = res.body.id;
    });

    it("deberia retornar 400 si el titulo falta (validacion Joi)", async () => {
      const res = await request(app)
        .post("/api/bitacora")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          descripcion: "Descripcion sin título ",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBe("El título es obligatorio");
    });
  });

  describe("GET /api/bitacora", () => {
    it("deberia obtener todas las entradas de la bitácora", async () => {
      const res = await request(app)
        .get("/api/bitacora")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("PUT /api/bitacora/:id", () => {
    it("deberia actualizar una entrada existente", async () => {
      const res = await request(app)
        .put(`/api/bitacora/${entradaId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          titulo: "Titulo Actualizado",
          descripcion: "Descripcion Actualizada",
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.titulo).toBe("Titulo Actualizado");
      expect(res.body.descripcion).toBe("Descripcion Actualizada");
    });

    it("deberia retornar 404 si la entrada no existe", async () => {
      const consoleErrorMock = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const res = await request(app)
        .put("/api/bitacora/99999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          titulo: "Inexistente",
          descripcion: "Inexistente",
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toBe("Entrada de bitacora no encontrada");

      consoleErrorMock.mockRestore();
    });
  });

  describe("DELETE /api/bitacora/:id", () => {
    it("deberia eliminar una entrada existente", async () => {
      const res = await request(app)
        .delete(`/api/bitacora/${entradaId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe("Entrada de bitácora eliminada");
    });

    it("deberia retornar 404 si la entrada ya fue eliminada", async () => {
      const consoleErrorMock = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const res = await request(app)
        .delete(`/api/bitacora/${entradaId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toBe("Entrada de bitácora no encontrada");

      consoleErrorMock.mockRestore();
    });
  });
});
