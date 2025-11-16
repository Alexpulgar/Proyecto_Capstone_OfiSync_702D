const pool = require('../../models/db');
const insumoLogic = require('./insumoLogic'); 

jest.mock('../../models/db', () => ({
  query: jest.fn(),
}));

describe('Pruebas Unitarias: insumoLogic', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crear', () => {
    it('debe calcular "activo" si stock > 0', async () => {
      const datosNuevos = {
        nombre: 'Toner 101',
        categoria: 'Impresión',
        stock: 10,
        stock_minimo: 5,
        
      };
      const mockResultado = { id: 1, ...datosNuevos, estado: 'activo' };
      pool.query.mockResolvedValueOnce({ rows: [mockResultado] });

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
        'activo', 
      ]);
      expect(resultado).toEqual(mockResultado);
    });

    it('debe calcular "inactivo" si stock <= 0', async () => {
        const datosNuevos = {
          nombre: 'Toner 102',
          categoria: 'Impresión',
          stock: 0,
          stock_minimo: 5,
        };
        const mockResultado = { id: 2, ...datosNuevos, estado: 'inactivo' };
        pool.query.mockResolvedValueOnce({ rows: [mockResultado] });
  
        const resultado = await insumoLogic.crear(datosNuevos);
  
        expect(pool.query).toHaveBeenCalledWith(
            expect.any(String), 
            [
                datosNuevos.nombre,
                datosNuevos.categoria,
                datosNuevos.stock,
                datosNuevos.stock_minimo,
                'inactivo',
            ]
        );
        expect(resultado).toEqual(mockResultado);
      });
  });

  describe('actualizar', () => {
    it('debe ejecutar un UPDATE y calcular el estado', async () => {
      const datosActualizados = {
        nombre: 'Resma Carta Premium',
        categoria: 'Oficina',
        stock: 50, // stock > 0
        stock_minimo: 10,
      };
      const mockResultado = { id: 1, ...datosActualizados, estado: 'activo' };

      // Mock para el check de existencia
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Viejo' }] });
      // Mock para el UPDATE
      pool.query.mockResolvedValueOnce({ rows: [mockResultado] });

      const resultado = await insumoLogic.actualizar(1, datosActualizados);

      const expectedQuery = `
    UPDATE insumo
    SET nombre = $1, categoria = $2, stock = $3, stock_minimo = $4, estado = $5
    WHERE id = $6
    RETURNING *
  `;
      expect(pool.query).toHaveBeenNthCalledWith(2, expectedQuery, [
        datosActualizados.nombre,
        datosActualizados.categoria,
        datosActualizados.stock,
        datosActualizados.stock_minimo,
        'activo', 
        1,
      ]);
      expect(resultado).toEqual(mockResultado);
    });
  });

});