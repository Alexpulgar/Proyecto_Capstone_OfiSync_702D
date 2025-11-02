const { validateInsumo } = require('../insumoValidator'); 

describe('validateInsumo (Logic)', () => {

  test('debería ser válido con datos correctos', () => {
    const body = { nombre: 'Papel', stock: 10, stock_minimo: 5 };
    const result = validateInsumo(body);
    expect(result.isValid).toBe(true);
  });
  
  test('debería ser válido con stock 0 (como string)', () => {
    const body = { nombre: 'Papel', stock: "0", stock_minimo: "0" };
    const result = validateInsumo(body);
    expect(result.isValid).toBe(true);
  });

  test('debería ser inválido si falta el nombre', () => {
    const body = { stock: 10, stock_minimo: 5 }; // Falta nombre
    const result = validateInsumo(body);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El nombre es obligatorio y debe ser un texto');
  });
  
  test('debería ser inválido si el stock es un string vacío', () => {
    const body = { nombre: 'Papel', stock: "", stock_minimo: 5 };
    const result = validateInsumo(body);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El stock es obligatorio');
  });
  
  test('debería ser inválido si el stock no es numérico (letras)', () => {
    const body = { nombre: 'Papel', stock: "diez", stock_minimo: 5 };
    const result = validateInsumo(body);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El stock debe ser numerico');
  });
  
  test('debería ser inválido si el stock es negativo', () => {
    const body = { nombre: 'Papel', stock: -1, stock_minimo: 5 };
    const result = validateInsumo(body);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El stock no puede ser negativo');
  });
  
  test('debería ser inválido si el stock mínimo es negativo', () => {
    const body = { nombre: 'Papel', stock: 10, stock_minimo: -1 };
    const result = validateInsumo(body);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El stock mínimo no puede ser negativo');
  });
});