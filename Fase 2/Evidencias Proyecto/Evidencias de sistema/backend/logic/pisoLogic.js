// backend/logic/pisoLogic.js

function procesarNuevosPisos(datos, edificio, pisosActuales) {
  const { cantidad } = datos;

  if (!cantidad || !edificio) {
    return { error: "Faltan datos obligatorios." };
  }

  if (pisosActuales + cantidad > edificio.pisos_totales) {
    return {
      error: `No puedes agregar ${cantidad} pisos. El edificio solo permite ${edificio.pisos_totales} en total.`,
    };
  }

  const areaBruta = parseFloat(edificio.area_bruta_por_piso);
  const areaComun = (areaBruta * parseFloat(edificio.area_comun_pct)) / 100;
  const areaUtil = areaBruta - areaComun;

  const nuevosPisos = [];
  for (let i = 1; i <= cantidad; i++) {
    nuevosPisos.push({
      numero_piso: pisosActuales + i,
      area_bruta: areaBruta,
      area_comun: areaComun,
      area_util: areaUtil,
    });
  }

  return { nuevosPisos };
}

module.exports = { procesarNuevosPisos };