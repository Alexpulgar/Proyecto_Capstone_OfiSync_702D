const { validarPersona } = require('../personaValidator');

describe('Pruebas exhaustivas de validarPersona', () => {

  // Caso feliz: el "camino ideal" donde todo funciona
  test('debería devolver null si todos los datos son válidos', () => {
    const personaValida = {
      rut: '12345678-9',
      nombre: 'Juan Andrés Pérez',
      correo: 'juan.perez@dominio.co',
      telefono: '987654321'
    };
    expect(validarPersona(personaValida)).toBeNull();
  });

  // --- Pruebas para el campo RUT ---
  describe('Validación de RUT', () => {
    test('debería ser válido con la letra K', () => {
      const persona = { rut: '11222333-K', nombre: 'a', correo: 'a@b.c', telefono: '12345678' };
      expect(validarPersona(persona)).toBeNull();
    });

    test('debería ser inválido si no tiene guión', () => {
      const persona = { rut: '123456789', nombre: 'a', correo: 'a@b.c', telefono: '12345678' };
      expect(validarPersona(persona)).toBe('El RUT debe tener el formato 12345678-9');
    });

    test('debería ser inválido si tiene letras antes del guión', () => {
      const persona = { rut: '1234567a-9', nombre: 'a', correo: 'a@b.c', telefono: '12345678' };
      expect(validarPersona(persona)).toBe('El RUT debe tener el formato 12345678-9');
    });
  });

  // --- Pruebas para el campo Nombre ---
  describe('Validación de Nombre', () => {
    test('debería ser inválido si contiene números', () => {
      const persona = { rut: '12345678-9', nombre: 'Juan123', correo: 'a@b.c', telefono: '12345678' };
      expect(validarPersona(persona)).toBe('El nombre solo puede contener letras y espacios');
    });

    test('debería ser inválido si contiene caracteres especiales', () => {
      const persona = { rut: '12345678-9', nombre: 'Juan Pérez!', correo: 'a@b.c', telefono: '12345678' };
      expect(validarPersona(persona)).toBe('El nombre solo puede contener letras y espacios');
    });
  });

  // --- Pruebas para el campo Correo ---
  describe('Validación de Correo', () => {
    test('debería ser inválido si no tiene "@"', () => {
      const persona = { rut: '12345678-9', nombre: 'a', correo: 'correo.sin.arroba.com', telefono: '12345678' };
      expect(validarPersona(persona)).toBe('Correo electrónico no válido');
    });

    test('debería ser inválido si no tiene un punto después del "@"', () => {
      const persona = { rut: '12345678-9', nombre: 'a', correo: 'correo@dominio', telefono: '12345678' };
      expect(validarPersona(persona)).toBe('Correo electrónico no válido');
    });
  });

  // --- Pruebas para el campo Teléfono ---
  describe('Validación de Teléfono', () => {
    test('debería ser inválido si es muy corto', () => {
      const persona = { rut: '12345678-9', nombre: 'a', correo: 'a@b.c', telefono: '123' };
      expect(validarPersona(persona)).toBe('El teléfono debe tener entre 8 y 12 dígitos');
    });

    test('debería ser inválido si es muy largo', () => {
      const persona = { rut: '12345678-9', nombre: 'a', correo: 'a@b.c', telefono: '1234567890123' };
      expect(validarPersona(persona)).toBe('El teléfono debe tener entre 8 y 12 dígitos');
    });
  });

  // --- Pruebas para campos vacíos o nulos ---
  describe('Validación de campos obligatorios', () => {
    test('debería retornar error si un campo está vacío', () => {
      const persona = { rut: '12345678-9', nombre: '', correo: 'a@b.c', telefono: '12345678' };
      expect(validarPersona(persona)).toBe('Faltan datos obligatorios');
    });

    test('debería retornar error si un campo es nulo', () => {
      const persona = { rut: '12345678-9', nombre: 'a', correo: null, telefono: '12345678' };
      expect(validarPersona(persona)).toBe('Faltan datos obligatorios');
    });
  });
});