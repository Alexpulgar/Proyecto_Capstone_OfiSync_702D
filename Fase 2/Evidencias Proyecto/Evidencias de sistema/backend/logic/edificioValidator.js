// backend/logic/edificioValidator.js

function validarEdificio(edificio) {
  const { nombre, pisos_totales, area_bruta_por_piso, area_comun_pct } = edificio;

  if (!nombre || !pisos_totales || !area_bruta_por_piso || !area_comun_pct) {
    return "Faltan datos obligatorios";
  }
  if (parseInt(pisos_totales) <= 0) {
    return "La cantidad de pisos debe ser positiva";
  }
  if (parseFloat(area_bruta_por_piso) <= 0) {
    return "El área bruta por piso debe ser positiva";
  }
  if (parseFloat(area_comun_pct) < 0 || parseFloat(area_comun_pct) > 100) {
    return "El porcentaje de área común debe estar entre 0 y 100";
  }
  
  return null; // Todo correcto
}

module.exports = { validarEdificio };