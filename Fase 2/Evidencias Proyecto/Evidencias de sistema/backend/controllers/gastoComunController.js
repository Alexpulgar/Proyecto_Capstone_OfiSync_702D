const pool = require("../models/db.js"); // conexión a la BD

// Calcular y registrar el gasto común
const calcularGastoComun = async (req, res) => {
  try {
    const { edificio_id, mes, total, descripcion } = req.body;

    if (!edificio_id || !mes || !total) {
      return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    // Crear el registro del gasto común
    const result = await pool.query(
      `INSERT INTO gastoComun (edificio_id, mes, total, descripcion)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [edificio_id, mes, total, descripcion || ""]
    );

    const gastoComunId = result.rows[0].id;

    // Calcular el área total del edificio
    const areaTotalRes = await pool.query(
      `SELECT SUM(o.area) AS total_area
       FROM oficina o
       JOIN piso p ON o.piso_id = p.id
       WHERE p.edificio_id = $1`,
      [edificio_id]
    );

    const totalArea = parseFloat(areaTotalRes.rows[0].total_area);

    if (!totalArea || totalArea <= 0) {
      return res.status(400).json({
        error: "El edificio no tiene oficinas registradas o las áreas son inválidas.",
      });
    }

    // Calcular gasto por m²
    const gastoPorM2 = total / totalArea;

    // Obtener las oficinas del edificio
    // Obtener solo las oficinas ocupadas del edificio
    const oficinasRes = await pool.query(
      `SELECT o.id, o.area
      FROM oficina o
      JOIN piso p ON o.piso_id = p.id
      WHERE p.edificio_id = $1
      AND o.estado = 'ocupada'`,
      [edificio_id]
    );

    // Verificar que haya oficinas ocupadas
    if (oficinasRes.rows.length === 0) {
      return res.status(400).json({
        error: "No hay oficinas ocupadas en este edificio.",
      });
    }

    // Insertar detalle de gasto solo para oficinas ocupadas
    for (const oficina of oficinasRes.rows) {
      const monto = parseFloat(oficina.area) * gastoPorM2;

      await pool.query(
        `INSERT INTO detalleGastoComun (gastoComunId, oficina_id, monto)
        VALUES ($1, $2, $3)`,
        [gastoComunId, oficina.id, monto]
      );
    }


    res.status(201).json({
      mensaje: " Gasto común calculado correctamente.",
      gastoComunId,
      gasto_por_m2: gastoPorM2.toFixed(2),
    });
  } catch (err) {
    console.error("Error al calcular gasto común:", err);
    res.status(500).json({ error: "Error interno al calcular gasto común." });
  }
};

module.exports = { calcularGastoComun };
