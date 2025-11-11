const pool = require("../models/db");

// Crear nueva entrada de bitácora
const crearEntrada = async (req, res) => {
  try {

    const { titulo, descripcion, tipo, es_privado } = req.body;
    // Obtener al autor
    const { id: autorId, nombre_usuario: autorNombre } = req.user;

    const query = `
      INSERT INTO bitacora (
      titulo, descripcion, tipo,
      autor_id, autor_nombre, es_privado
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [
      titulo.trim(),
      descripcion.trim(),
      tipo || 'General',
      autorId,
      autorNombre,
      es_privado || false,
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
      SELECT id, titulo, descripcion, tipo, creado_en, autor_nombre, es_privado
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

//Actualizar
const actualizarEntrada = async (req, res) => {
  try {
    const {id} = req.params;
    const {titulo, descripcion, tipo, es_privado} = req.body;
  
    const query = `
      UPDATE bitacora
      SET 
        titulo = $1, 
        descripcion = $2, 
        tipo = $3, 
        es_privado = $4
      WHERE id = $5
      RETURNING *
    `;

    const params = [
      titulo.trim(), descripcion.trim(), tipo || 'General',
      es_privado || false, id
    ];

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: " Entrada de bitacora no encontrada"});
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error al actualizar entrada", err);
    res.status(500).json({ error: "Error interno al actualizar entrada"});
  }
};

//Borrar
const borrarEntrada = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM bitacora WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Entrada de bitácora no encontrada." });
    }
    // Devolvemos un mensaje de éxito.
    res.status(200).json({ message: "Entrada de bitácora eliminada" });

  } catch (err) {
    console.error("Error al borrar entrada:", err);
    res.status(500).json({ error: "Error interno al borrar entrada" });
  }
};

module.exports = {
  crearEntrada,
  obtenerEntradas,
  actualizarEntrada,
  borrarEntrada,
};