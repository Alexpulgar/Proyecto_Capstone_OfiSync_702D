// backend/logic/oficinaValidator.js

function validarOficina(oficina) {
  const { codigo, piso_id, area, estado, persona_id, edificio_id } = oficina;

  if (!codigo || !piso_id || !area || !edificio_id) {
    return "Faltan datos obligatorios";
  }
  if (isNaN(codigo)) {
    return "El código debe ser un número.";
  }
  if (codigo.toString().length > 6) {
    return "El código no puede tener más de 6 dígitos.";
  }
  if (Number(codigo) <= 0) {
    return "El código debe ser un número positivo";
  }
  if (isNaN(area) || Number(area) <= 0) {
    return "El área(m²) debe ser un número positivo";
  }
  if (estado && estado.toLowerCase() === "ocupada" && !persona_id) {
    return "Debe asignar un arrendatario cuando la oficina está ocupada.";
  }

  return null; // Todo correcto
}

module.exports = { validarOficina };