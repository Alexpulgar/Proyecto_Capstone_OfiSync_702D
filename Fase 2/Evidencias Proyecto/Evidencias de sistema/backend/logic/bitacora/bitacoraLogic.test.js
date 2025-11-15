/*
 * -----------------------------------------------------------------
 * Archivo Corregido: logic/bitacora/bitacoraLogic.test.js
 * -----------------------------------------------------------------
 *
 * NOTAS DE CORRECCIÓN:
 * 1.  El 'jest.mock' ahora simula 'db.js' (que exporta 'pool'
 * directamente).
 * 2.  La importación 'const pool = require(...)' ahora importa el mock.
 * 3.  Se corrigió la aserción en 'actualizarEntrada' para que
 * 'toHaveBeenCalledWith' use la query multilínea exacta
 * de 'bitacoraLogic.js', solucionando el fallo del test.
 */

const bitacoraLogic = require('./bitacoraLogic');

// 1. Simular 'db.js' que exporta 'pool' directamente
jest.mock('../../models/db', () => ({
  query: jest.fn(),
}));

// 2. Importar el 'pool' (que ahora es nuestro mock)
const pool = require('../../models/db');

describe('Prueba Unitaria: bitacoraLogic', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- PRUEBA CREAR ---
  test('crearEntrada debe ejecutar una query de INSERT', async () => {
    const mockDatos = {
      titulo: 'Test',
      descripcion: 'Desc',
      tipo: 'Prueba',
      autorId: 1,
      autorNombre: 'Admin',
    };
    const mockResultado = {
      rows: [{ id: 1, ...mockDatos, creado_en: new Date() }],
    };

    pool.query.mockResolvedValue(mockResultado);
    const resultado = await bitacoraLogic.crearEntrada(mockDatos);

    const expectedQuery = `
    INSERT INTO bitacora (
    titulo, descripcion, tipo,
    autor_id, autor_nombre
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

    expect(pool.query).toHaveBeenCalledWith(expectedQuery, [
      'Test',
      'Desc',
      'Prueba',
      1,
      'Admin',
    ]);
    expect(resultado).toEqual(mockResultado.rows[0]);
  });

  // --- PRUEBA OBTENER TODAS ---
  test('obtenerEntradas debe ejecutar una query de SELECT', async () => {
    const mockResultado = { rows: [{ id: 1, titulo: 'Test' }] };
    pool.query.mockResolvedValue(mockResultado);

    const resultado = await bitacoraLogic.obtenerEntradas();
    const expectedQuery = `
    SELECT id, titulo, descripcion, tipo, creado_en, autor_nombre
    FROM bitacora
    ORDER BY creado_en DESC
  `;

    expect(pool.query).toHaveBeenCalledWith(expectedQuery);
    expect(resultado).toEqual(mockResultado.rows);
  });

  // --- PRUEBA ACTUALIZAR ---
  // 3. Corregido para el fallo de aserción
  test('actualizarEntrada debe ejecutar una query de UPDATE', async () => {
    const mockDatos = {
      titulo: 'Actualizado',
      descripcion: 'Desc actualizada',
      tipo: 'General',
    };
    const mockResultado = { rows: [{ id: 1, ...mockDatos }] };
    pool.query.mockResolvedValue(mockResultado);

    const resultado = await bitacoraLogic.actualizarEntrada(1, mockDatos);

    const expectedQuery = `
    UPDATE bitacora
    SET titulo = $1, descripcion = $2, tipo = $3
    WHERE id = $4
    RETURNING *
  `;

    expect(pool.query).toHaveBeenCalledWith(expectedQuery, [
      'Actualizado',
      'Desc actualizada',
      'General',
      1,
    ]);
    expect(resultado).toEqual(mockResultado.rows[0]);
  });

  // --- PRUEBA BORRAR ---
  test('borrarEntrada debe ejecutar una query de DELETE', async () => {
    const mockResultado = {
      rows: [{ id: 1, titulo: 'Borrado' }],
    };
    pool.query.mockResolvedValue(mockResultado);

    const resultado = await bitacoraLogic.borrarEntrada(1);

    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM bitacora WHERE id = $1 RETURNING *',
      [1]
    );
    expect(resultado).toEqual({ message: 'Entrada de bitácora eliminada' });
  });

  test('borrarEntrada debe lanzar un error si la bitacora no se encuentra', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    await expect(bitacoraLogic.borrarEntrada(999)).rejects.toThrow(
      'Entrada de bitácora no encontrada'
    );
  });
});