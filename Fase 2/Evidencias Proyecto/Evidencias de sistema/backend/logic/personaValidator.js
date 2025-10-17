function validarPersona(persona) {
  const { nombre, correo, telefono, rut } = persona;

  if (!nombre || !correo || !telefono || !rut) {
    return "Faltan datos obligatorios";
  }
  if (!/^\d{7,8}-[0-9kK]$/.test(rut)) {
    return "El RUT debe tener el formato 12345678-9";
  }
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
    return "El nombre solo puede contener letras y espacios";
  }
  if (!/\S+@\S+\.\S+/.test(correo)) {
    return "Correo electrónico no válido";
  }
  if (telefono.length < 8 || telefono.length > 12) {
    return "El teléfono debe tener entre 8 y 12 dígitos";
  }
  // Si todas las validaciones pasan, no hay error.
  return null;
}

module.exports = { validarPersona };