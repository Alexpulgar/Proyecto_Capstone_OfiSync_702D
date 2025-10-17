const { validarEdificio } = require('../edificioValidator');

describe('Pruebas de validarEdificio', () => {

  test('debería devolver null si todos los datos son válidos', () => {
    const edificioValido = {
      nombre: "Torre Central",
      pisos_totales: "20",
      area_bruta_por_piso: "500",
      area_comun_pct: "15"
    };
    expect(validarEdificio(edificioValido)).toBeNull();
  });

  test('debería devolver error si faltan campos', () => {
    const edificioInvalido = { nombre: "Torre Incompleta", pisos_totales: "10" };
    expect(validarEdificio(edificioInvalido)).toBe("Faltan datos obligatorios");
  });

  test('debería devolver error si los pisos son cero o negativos', () => {
    const edificioConCeroPisos = { nombre: "Edificio Cero", pisos_totales: "0", area_bruta_por_piso: "100", area_comun_pct: "10" };
    expect(validarEdificio(edificioConCeroPisos)).toBe("La cantidad de pisos debe ser positiva");
  });

  test('debería devolver error si el porcentaje de área común es mayor a 100', () => {
    const edificioInvalido = { nombre: "Torre Excesiva", pisos_totales: "10", area_bruta_por_piso: "200", area_comun_pct: "101" };
    expect(validarEdificio(edificioInvalido)).toBe("El porcentaje de área común debe estar entre 0 y 100");
  });
});