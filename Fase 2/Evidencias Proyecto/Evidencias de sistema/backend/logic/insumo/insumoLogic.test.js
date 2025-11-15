// 1. Mockear 'models/db' ANTES de importar la lógica
jest.mock('../../models/db', () => ({
  query: jest.fn(),
}));

// Importar el mock y la lógica
const pool = require('../../models/db');
const insumoLogic = require('./insumoLogic'); // Importa la lógica a probar

describe('Pruebas Unitarias: insumoLogic', () => {
  // Limpiar mocks después de cada prueba
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Test para obtenerTodos ---
  test('obtenerTodos debe ejecutar un SELECT * ordenado por nombre', async () => {
    const mockInsumos = [{ id: 1, nombre: 'Resma de Papel' }];
    pool.query.mockResolvedValue({ rows: mockInsumos });

    const resultado = await insumoLogic.obtenerTodos();

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM insumos ORDER BY nombre ASC'
    );
    expect(resultado).toEqual(mockInsumos);
  });

  // --- Test para obtenerPorId (Éxito) ---
  test('obtenerPorId debe retornar un insumo si se encuentra', async () => {
    const mockInsumo = { id: 1, nombre: 'Resma de Papel' };
    pool.query.mockResolvedValue({ rows: [mockInsumo] });

    const resultado = await insumoLogic.obtenerPorId(1);

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM insumos WHERE id = $1',
      [1]
    );
    expect(resultado).toEqual(mockInsumo);
  });

  // --- Test para obtenerPorId (Fallo) ---
  test('obtenerPorId debe lanzar un error si no se encuentra', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await expect(insumoLogic.obtenerPorId(999)).rejects.toThrow(
      'Insumo no encontrado'
    );
  });

  // --- Test para crear ---
  test('crear debe ejecutar un INSERT con las columnas correctas', async () => {
    const datosNuevos = {
      nombre: 'Toner 101',
      categoria: 'Impresión',
      stock: 10,
      stock_minimo: 5,
      estado: 'Activo',
    };
    const mockInsumoCreado = { id: 2, ...datosNuevos };
    pool.query.mockResolvedValue({ rows: [mockInsumoCreado] });

    const resultado = await insumoLogic.crear(datosNuevos);

    const expectedQuery = `
    INSERT INTO insumos (nombre, categoria, stock, stock_minimo, estado)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

    expect(pool.query).toHaveBeenCalledWith(expectedQuery, [
      datosNuevos.nombre,
      datosNuevos.categoria,
      datosNuevos.stock,
      datosNuevos.stock_minimo,
      datosNuevos.estado,
    ]);
    expect(resultado).toEqual(mockInsumoCreado);
  });

  // --- Test para actualizar (Éxito) ---
  test('actualizar debe ejecutar un UPDATE con las columnas correctas', async () => {
    const datosActualizados = {
      nombre: 'Resma Carta Premium',
      categoria: 'Oficina',
      stock: 50,
      stock_minimo: 10,
      estado: 'Activo',
    };
    const mockInsumoActualizado = { id: 1, ...datosActualizados };

    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, nombre: 'Viejo' }],
    });
    pool.query.mockResolvedValueOnce({ rows: [mockInsumoActualizado] });

    const resultado = await insumoLogic.actualizar(1, datosActualizados);

    const expectedQuery = `
    UPDATE insumos
    SET nombre = $1, categoria = $2, stock = $3, stock_minimo = $4, estado = $5
    WHERE id = $6
    RETURNING *
  `;

    expect(pool.query).toHaveBeenCalledTimes(2); 
    expect(pool.query).toHaveBeenNthCalledWith(2, expectedQuery, [
      datosActualizados.nombre,
      datosActualizados.categoria,
      datosActualizados.stock,
      datosActualizados.stock_minimo,
      datosActualizados.estado,
      1, // el ID
    ]);
    expect(resultado).toEqual(mockInsumoActualizado);
  });

  // --- Test para actualizar (Fallo) ---
  test('actualizar debe lanzar error si el insumo no existe', async () => {
    pool.query.mockResolvedValue({ rows: [] }); // Simula que no se encontró
    await expect(
      insumoLogic.actualizar(999, { nombre: 'Test' })
    ).rejects.toThrow('Insumo no encontrado');
  });

  // --- Test para eliminar (Éxito) ---
  test('eliminar debe ejecutar un DELETE', async () => {
    pool.query.mockResolvedValue({
      rows: [{ id: 1, nombre: 'Borrado' }],
    });
    const resultado = await insumoLogic.eliminar(1);

    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM insumos WHERE id = $1 RETURNING *',
      [1]
    );
    expect(resultado).toEqual({ message: 'Insumo eliminado' });
  });
});