
const { validateInsumo } = require('./insumoValidator'); 

describe('Pruebas Unitarias: validateInsumo', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn(() => mockResponse), // Permite encadenar .status().json()
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  // --- Prueba de Éxito ---
  test('debe llamar a next() si los datos son válidos', () => {
    mockRequest.body = {
      nombre: 'Resma de Papel',
      categoria: 'Oficina',
      stock: 100,
      stock_minimo: 20,
      estado: 'Activo',
    };

    validateInsumo(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).toHaveBeenCalledTimes(1); // Se llamó a next()
    expect(mockResponse.status).not.toHaveBeenCalled(); // No se envió respuesta de error
  });

  // --- Pruebas de Fallo ---
  test('debe retornar 400 si el nombre falta', () => {
    mockRequest.body = {
      // nombre falta
      categoria: 'Oficina',
      stock: 100,
      stock_minimo: 20,
      estado: 'Activo',
    };

    validateInsumo(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled(); // No se llamó a next()
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      errors: expect.stringContaining('El nombre es obligatorio'),
    });
  });

  test('debe retornar 400 si el stock es negativo', () => {
    mockRequest.body = {
      nombre: 'Resma',
      categoria: 'Oficina',
      stock: -5, // Valor inválido
      stock_minimo: 20,
      estado: 'Activo',
    };

    validateInsumo(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      errors: expect.stringContaining('El stock no puede ser negativo'),
    });
  });

  test('debe retornar 400 si faltan múltiples campos', () => {
    mockRequest.body = {
      // Faltan nombre y categoria
      stock: 10,
    };

    validateInsumo(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    // Verifica que múltiples errores sean reportados
    expect(mockResponse.json).toHaveBeenCalledWith({
      errors: expect.stringContaining('El nombre es obligatorio'),
    });
    expect(mockResponse.json).toHaveBeenCalledWith({
      errors: expect.stringContaining('La categoría es obligatoria'),
    });
  });
});