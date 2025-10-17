import { validarFormularioPersona, 
        validarFormularioGastoComun,
        validarFormularioEdificio,
        validarFormularioOficina,
        validarFormularioPiso  } from '../validators';

describe('validarFormularioPersona', () => {
  
  it('debería retornar null para un formulario válido', () => {
    const formValido = {
      nombre: 'Maria González',
      correo: 'maria@gonzalez.cl',
      telefono: '912345678',
      rut: '9876543-2'
    };
    const resultado = validarFormularioPersona(formValido);
    expect(resultado).toBeNull();
  });

  it('debería retornar un error para un nombre con números', () => {
    const formInvalido = {
      nombre: 'Maria123',
      correo: 'maria@gonzalez.cl',
      telefono: '912345678',
      rut: '9876543-2'
    };
    const resultado = validarFormularioPersona(formInvalido);
    expect(resultado).toBe('El nombre solo puede contener letras y espacios');
  });

  it('debería retornar un error para un teléfono muy corto', () => {
    const formInvalido = {
      nombre: 'Maria Gonzalez',
      correo: 'maria@gonzalez.cl',
      telefono: '1234',
      rut: '9876543-2'
    };
    const resultado = validarFormularioPersona(formInvalido);
    expect(resultado).toBe('El teléfono debe tener entre 8 y 12 dígitos');
  });
});

describe('validarFormularioGastoComun', () => {

  test('debería retornar null si todos los campos son válidos', () => {
    const formValido = {
      edificio_id: "1",
      mes: "Octubre 2025",
      total: "500000",
      descripcion: "Gastos del mes"
    };
    expect(validarFormularioGastoComun(formValido)).toBeNull();
  });

  test('debería retornar error si falta el ID del edificio', () => {
    const formInvalido = {
      edificio_id: "",
      mes: "Octubre 2025",
      total: "500000"
    };
    expect(validarFormularioGastoComun(formInvalido)).toBe('Debe completar los campos obligatorios');
  });

  test('debería retornar error si el total es cero o negativo', () => {
    const formConCero = {
      edificio_id: "1",
      mes: "Octubre 2025",
      total: "0"
    };
    const formConNegativo = {
        edificio_id: "1",
        mes: "Octubre 2025",
        total: "-1000"
      };
    expect(validarFormularioGastoComun(formConCero)).toBe('El total de gastos debe ser un número positivo');
    expect(validarFormularioGastoComun(formConNegativo)).toBe('El total de gastos debe ser un número positivo');
  });

  test('debería funcionar correctamente incluso si la descripción está vacía', () => {
    const formValido = {
        edificio_id: "1",
        mes: "Octubre 2025",
        total: "500000",
        descripcion: ""
      };
      expect(validarFormularioGastoComun(formValido)).toBeNull();
  });

});

describe('validarFormularioEdificio', () => {

  test('debería retornar null para un formulario de edificio válido', () => {
    const formValido = {
      nombre: "Torre Alfa",
      pisos_totales: 15,
      area_bruta_por_piso: 300,
      area_comun_pct: 20
    };
    expect(validarFormularioEdificio(formValido)).toBeNull();
  });

  test('debería retornar error si el área por piso es negativa', () => {
    const formInvalido = {
      nombre: "Torre Beta",
      pisos_totales: 10,
      area_bruta_por_piso: -50,
      area_comun_pct: 10
    };
    expect(validarFormularioEdificio(formInvalido)).toBe('El área bruta por piso debe ser positiva');
  });

  test('debería retornar error si el porcentaje de área común es negativo', () => {
    const formInvalido = {
      nombre: "Torre Gamma",
      pisos_totales: 5,
      area_bruta_por_piso: 100,
      area_comun_pct: -5
    };
    expect(validarFormularioEdificio(formInvalido)).toBe('El porcentaje de área común debe estar entre 0 y 100');
  });
});


describe('validarFormularioOficina', () => {

  test('debería retornar null para un formulario de oficina válido', () => {
    const formValido = {
      codigo: "303",
      piso_id: "5",
      area: "85.5",
      estado: "libre",
      persona_id: "",
      edificio_id: "2"
    };
    expect(validarFormularioOficina(formValido)).toBeNull();
  });

  test('debería retornar error si falta el código', () => {
    const formInvalido = {
      codigo: "",
      piso_id: "5",
      area: "85"
    };
    expect(validarFormularioOficina(formInvalido)).toBe('Faltan campos obligatorios');
  });

  test('debería retornar error si el área no es un número positivo', () => {
    const formInvalido = {
      codigo: "404",
      piso_id: "6",
      area: "-10"
    };
    expect(validarFormularioOficina(formInvalido)).toBe('El área debe ser un número positivo');
  });
});


describe('validarFormularioPiso', () => {
  
  test('debería retornar null si los datos son válidos', () => {
    const form = { edificio_id: "1", cantidad: "5" };
    const pisosDisponibles = 10;
    expect(validarFormularioPiso(form, pisosDisponibles)).toBeNull();
  });

  test('debería retornar error si la cantidad es mayor a los pisos disponibles', () => {
    const form = { edificio_id: "1", cantidad: "5" };
    const pisosDisponibles = 4;
    expect(validarFormularioPiso(form, pisosDisponibles)).toBe('Solo puedes agregar hasta 4 pisos.');
  });

  test('debería retornar error si la cantidad es un número negativo', () => {
    const form = { edificio_id: "1", cantidad: "-2" };
    const pisosDisponibles = 10;
    expect(validarFormularioPiso(form, pisosDisponibles)).toBe('La cantidad debe ser un número positivo.');
  });
});