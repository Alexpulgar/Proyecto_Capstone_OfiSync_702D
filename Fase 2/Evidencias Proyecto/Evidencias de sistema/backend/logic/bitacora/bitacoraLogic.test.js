const pool = require("../../models/db");
const bitacoraLogic = require("./bitacoraLogic");

jest.mock("../../models/db", () => ({
  query: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe("Logica de bitacora - borrarEntrada", () => {
  it("Debe lanzar un error si la bitacora no se encuentra", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    await expect(bitacoraLogic.borrarEntrada(999)).rejects.toThrow(
      "Entrada de bitácora no encontrada"
    );

    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it("Debe devolver un mensaje de exito si se borrar la entrada", async () => {
    const mockRespuestaBD = { rows: [{ id: 1, titulo: "Borrado" }] };
    pool.query.mockResolvedValue(mockRespuestaBD);

    const resultado = await bitacoraLogic.borrarEntrada(1);

    expect(resultado).toEqual({ message: "Entrada de bitácora eliminada" });

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
  });
});
