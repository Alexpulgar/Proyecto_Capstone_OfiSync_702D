const { validateInsumo } = require('./insumoValidator'); // Ajusta la ruta si es necesario

describe('Pruebas Unitarias: validateInsumo', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    // Mock de request con un cuerpo válido
    mockRequest = {
      body: {
        nombre: 'Insumo de Prueba',
        categoria: 'Limpieza',
        stock: 10,
        stock_minimo: 1,
      },
    };
    // Mock de response
    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    };
    // Mock de next
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe llamar a next() si los datos son válidos', () => {
    validateInsumo(mockRequest, mockResponse, nextFunction);
    
    expect(nextFunction).toHaveBeenCalledTimes(1); // Debería pasar
    expect(mockResponse.status).not.toHaveBeenCalled(); 
  });

  it('debe devolver 400 si faltan campos obligatorios', () => {
    mockRequest.body = { nombre: 'Incompleto' }; // Faltan campos
    
    validateInsumo(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled(); // No debe llamar a next
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      errors: expect.stringContaining('La categoría es obligatoria'),
    });
  });

  it('debe devolver 400 si el stock es negativo', () => {
    mockRequest.body.stock = -5; // Stock negativo
    
    validateInsumo(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      errors: expect.stringContaining('El stock no puede ser negativo'),
    });
  });
});