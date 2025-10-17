const { procesarNuevosPisos } = require('../pisoLogic');

describe('Pruebas de procesarNuevosPisos', () => {

  const edificioMock = {
    pisos_totales: 10,
    area_bruta_por_piso: "500",
    area_comun_pct: "20" // 100m² de área común, 400m² de área útil
  };

  test('debería calcular correctamente los datos de los nuevos pisos', () => {
    const datos = { cantidad: 2 };
    const pisosActuales = 5;

    const resultado = procesarNuevosPisos(datos, edificioMock, pisosActuales);

    expect(resultado.nuevosPisos).toHaveLength(2);
    expect(resultado.nuevosPisos[0]).toEqual({
      numero_piso: 6,
      area_bruta: 500,
      area_comun: 100,
      area_util: 400
    });
    expect(resultado.nuevosPisos[1].numero_piso).toBe(7);
  });

  test('debería devolver un error si se excede el total de pisos', () => {
    const datos = { cantidad: 3 };
    const pisosActuales = 8; // 8 + 3 = 11, pero el máximo es 10

    const resultado = procesarNuevosPisos(datos, edificioMock, pisosActuales);
    expect(resultado.error).toBe('No puedes agregar 3 pisos. El edificio solo permite 10 en total.');
  });

  test('debería funcionar correctamente si se alcanza justo el máximo de pisos', () => {
    const datos = { cantidad: 2 };
    const pisosActuales = 8; // 8 + 2 = 10, el máximo permitido

    const resultado = procesarNuevosPisos(datos, edificioMock, pisosActuales);
    expect(resultado.error).toBeUndefined();
    expect(resultado.nuevosPisos).toHaveLength(2);
  });
});