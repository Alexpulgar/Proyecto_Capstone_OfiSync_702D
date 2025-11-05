const pool = require("../models/db");

// Crear nueva entrada de bitácora
const crearEntrada = async (req, res) => {
  try {

    const { titulo, descripcion, tipo } = req.body;

    const query = `
      INSERT INTO bitacora (titulo, descripcion, tipo)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const params = [
      titulo.trim(),
      descripcion.trim(),
      tipo || 'General',
    ];
    
    const result = await pool.query(query, params);
    res.status(201).json(result.rows[0]);
    
  } catch (err) {
    console.error("Error al crear entrada de bitácora:", err);
    res.status(500).json({ error: "Error interno al crear entrada de bitácora" });
  }
};

// Obtener todas las entradas de bitácora
const obtenerEntradas = async (req, res) => {
  try {
    const query = `
      SELECT id, titulo, descripcion, tipo, creado_en
      FROM bitacora
      ORDER BY creado_en DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener bitácora:", err);
    res.status(500).json({ error: "Error al obtener bitácora" });
  }
};

module.exports = {
  crearEntrada,
  obtenerEntradas,
};