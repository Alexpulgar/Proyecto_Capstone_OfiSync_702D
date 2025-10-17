function calcularDesgloseGastoComun(totalGasto, oficinas) {
  if (!oficinas || oficinas.length === 0) {
    return { error: "No hay oficinas para calcular el gasto." };
  }

  const totalArea = oficinas.reduce((sum, oficina) => sum + oficina.area, 0);

  if (totalArea <= 0) {
    return { error: "El área total del edificio debe ser mayor a cero." };
  }

  const gastoPorM2 = totalGasto / totalArea;

  const desglose = oficinas.map(oficina => ({
    oficina_id: oficina.id,
    monto: oficina.area * gastoPorM2,
  }));

  return {
    gastoPorM2,
    desglose,
  };
}

module.exports = { calcularDesgloseGastoComun };