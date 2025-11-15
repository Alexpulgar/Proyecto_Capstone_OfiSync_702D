
jest.mock('../../models/db', () => ({
  query: jest.fn(),
}));

const pool = require('../../models/db');
const insumoLogic = require('./insumoLogic');

describe('Pruebas Unitarias: insumoLogic', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('obtenerTodos debe ejecutar un SELECT * ordenado por nombre', async () => {
    const mockInsumos = [{ id: 1, nombre: 'Resma de Papel' }];
    pool.query.mockResolvedValue({ rows: mockInsumos });
    const resultado = await insumoLogic.obtenerTodos();
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM insumo ORDER BY nombre ASC' 
    );
    expect(resultado).toEqual(mockInsumos);
  });

  test('obtenerPorId debe retornar un insumo si se encuentra', async () => {
    const mockInsumo = { id: 1, nombre: 'Resma de Papel' };
    pool.query.mockResolvedValue({ rows: [mockInsumo] });
    const resultado = await insumoLogic.obtenerPorId(1);
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM insumo WHERE id = $1', 
      [1]
    );
    expect(resultado).toEqual(mockInsumo);
  });

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
    INSERT INTO insumo (nombre, categoria, stock, stock_minimo, estado)
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
    UPDATE insumo
    SET nombre = $1, categoria = $2, stock = $3, stock_minimo = $4, estado = $5
    WHERE id = $6
    RETURNING *
  `; 
    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      'SELECT * FROM insumo WHERE id = $1', 
      [1]
    );
    expect(pool.query).toHaveBeenNthCalledWith(2, expectedQuery, [
      datosActualizados.nombre,
      datosActualizados.categoria,
      datosActualizados.stock,
      datosActualizados.stock_minimo,
      datosActualizados.estado,
      1,
    ]);
    expect(resultado).toEqual(mockInsumoActualizado);
  });

  test('eliminar debe ejecutar un DELETE', async () => {
    pool.query.mockResolvedValue({
      rows: [{ id: 1, nombre: 'Borrado' }],
    });
    const resultado = await insumoLogic.eliminar(1);
    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM insumo WHERE id = $1 RETURNING *', 
      [1]
    );
    expect(resultado).toEqual({ message: 'Insumo eliminado' });
  });

  test('obtenerPorId debe lanzar un error si no se encuentra', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await expect(insumoLogic.obtenerPorId(999)).rejects.toThrow(
      'Insumo no encontrado'
    );
  });
  test('actualizar debe lanzar error si el insumo no existe', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await expect(
      insumoLogic.actualizar(999, { nombre: 'Test' })
    ).rejects.toThrow('Insumo no encontrado');
  });
  test('eliminar debe lanzar error si el insumo no existe', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await expect(insumoLogic.eliminar(999)).rejects.toThrow(
      'Insumo no encontrado'
    );
  });
});