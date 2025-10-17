const { calcularDesgloseGastoComun } = require('../gastoComunLogic');

describe('Pruebas de calcularDesgloseGastoComun', () => {

  test('debería calcular el desglose correctamente para varias oficinas', () => {
    const totalGasto = 1000;
    const oficinas = [
      { id: 1, area: 100 }, // Debería pagar 500
      { id: 2, area: 100 }, // Debería pagar 500
    ];

    const resultado = calcularDesgloseGastoComun(totalGasto, oficinas);

    expect(resultado.gastoPorM2).toBe(5);
    expect(resultado.desglose).toEqual([
      { oficina_id: 1, monto: 500 },
      { oficina_id: 2, monto: 500 },
    ]);
  });

  test('debería prorratear el gasto según el área de cada oficina', () => {
    const totalGasto = 1000;
    const oficinas = [
      { id: 1, area: 75 }, // Debería pagar 750 (75% del total)
      { id: 2, area: 25 }, // Debería pagar 250 (25% del total)
    ];

    const resultado = calcularDesgloseGastoComun(totalGasto, oficinas);

    expect(resultado.gastoPorM2).toBe(10);
    expect(resultado.desglose).toEqual([
      { oficina_id: 1, monto: 750 },
      { oficina_id: 2, monto: 250 },
    ]);
  });

  test('debería devolver un error si el área total es cero', () => {
    const totalGasto = 1000;
    const oficinas = [
      { id: 1, area: 0 },
      { id: 2, area: 0 },
    ];

    const resultado = calcularDesgloseGastoComun(totalGasto, oficinas);
    expect(resultado.error).toBe('El área total del edificio debe ser mayor a cero.');
  });

  test('debería devolver un error si no se proporcionan oficinas', () => {
    const totalGasto = 1000;
    const oficinas = [];

    const resultado = calcularDesgloseGastoComun(totalGasto, oficinas);
    expect(resultado.error).toBe('No hay oficinas para calcular el gasto.');
  });
});