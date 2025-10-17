
export function validarFormularioPersona(form) {
    if (!form.nombre || !form.correo || !form.telefono || !form.rut) {
        return "Faltan campos obligatorios";
    }
    if (!/^\d{7,8}-[0-9kK]$/.test(form.rut)) {
        return "El RUT debe tener el formato 12345678-9";
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.nombre)) {
        return "El nombre solo puede contener letras y espacios";
    }
    if (!/\S+@\S+\.\S+/.test(form.correo)) {
        return "Correo electrónico no válido";
    }
    if (form.telefono.length < 8 || form.telefono.length > 12) {
        return "El teléfono debe tener entre 8 y 12 dígitos";
    }
    return null;
}

// Función pura para validar el formulario de Gasto Común
export function validarFormularioGastoComun(form) {
  if (!form.edificio_id || !form.mes || !form.total) {
    return "Debe completar los campos obligatorios";
  }
  if (parseFloat(form.total) <= 0) {
    return "El total de gastos debe ser un número positivo";
  }
  // Si todo es correcto, no hay error
  return null;
}

// Función pura para validar el formulario de Edificio
export function validarFormularioEdificio(form) {
  if (!form.nombre || !form.pisos_totales || !form.area_bruta_por_piso || !form.area_comun_pct) {
    return "Faltan campos obligatorios";
  }
  if (Number(form.pisos_totales) <= 0) {
    return "La cantidad de pisos debe ser positiva";
  }
  if (Number(form.area_bruta_por_piso) <= 0) {
    return "El área bruta por piso debe ser positiva";
  }
  if (Number(form.area_comun_pct) < 0 || Number(form.area_comun_pct) > 100) {
    return "El porcentaje de área común debe estar entre 0 y 100";
  }
  return null;
}

// Función pura para validar el formulario de Oficina
export function validarFormularioOficina(form) {
  if (!form.codigo || !form.piso_id || !form.area) {
    return "Faltan campos obligatorios";
  }
  if (isNaN(form.area) || Number(form.area) <= 0) {
    return "El área debe ser un número positivo";
  }
  return null;
}

// Función pura para validar el formulario de Piso
export function validarFormularioPiso(form, pisosDisponibles) {
  if (!form.edificio_id || !form.cantidad) {
    return "Debe seleccionar un edificio y especificar una cantidad.";
  }
  if (isNaN(form.cantidad) || parseInt(form.cantidad) <= 0) {
    return "La cantidad debe ser un número positivo.";
  }
  if (parseInt(form.cantidad) > pisosDisponibles) {
    return `Solo puedes agregar hasta ${pisosDisponibles} pisos.`;
  }
  return null;
}