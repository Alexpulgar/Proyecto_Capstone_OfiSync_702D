const { validarOficina } = require('../oficinaValidator');

describe('Pruebas de validarOficina', () => {

  test('debería devolver null si los datos son válidos para una oficina libre', () => {
    const oficinaValida = {
      codigo: "101",
      piso_id: 1,
      area: "50",
      estado: "libre",
      persona_id: null,
      edificio_id: 1
    };
    expect(validarOficina(oficinaValida)).toBeNull();
  });

  test('debería devolver null si una oficina está ocupada y tiene arrendatario', () => {
    const oficinaValida = {
      codigo: "102",
      piso_id: 1,
      area: "60",
      estado: "ocupada",
      persona_id: 5, // ID del arrendatario
      edificio_id: 1
    };
    expect(validarOficina(oficinaValida)).toBeNull();
  });

  test('debería devolver error si está ocupada pero no tiene arrendatario', () => {
    const oficinaInvalida = {
      codigo: "103",
      piso_id: 2,
      area: "70",
      estado: "ocupada",
      persona_id: null, // No tiene arrendatario
      edificio_id: 1
    };
    expect(validarOficina(oficinaInvalida)).toBe("Debe asignar un arrendatario cuando la oficina está ocupada.");
  });

  test('debería devolver error si el código tiene más de 6 dígitos', () => {
    const oficinaInvalida = {
      codigo: "1234567",
      piso_id: 2,
      area: "50",
      edificio_id: 1
    };
    expect(validarOficina(oficinaInvalida)).toBe("El código no puede tener más de 6 dígitos.");
  });

  test('debería devolver error si el área es cero', () => {
    const oficinaInvalida = {
      codigo: "201",
      piso_id: 2,
      area: "0",
      edificio_id: 1
    };
    expect(validarOficina(oficinaInvalida)).toBe("El área(m²) debe ser un número positivo");
  });
});