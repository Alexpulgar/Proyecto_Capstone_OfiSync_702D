const pool = require("../../models/db");

const crearEntrada = async (datos) => {
  const { titulo, descripcion, tipo, autorId, autorNombre } = datos;

  const query = `
    INSERT INTO bitacora (
    titulo, descripcion, tipo,
    autor_id, autor_nombre
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const params = [
    titulo.trim(),
    descripcion.trim(),
    tipo || "General",
    autorId,
    autorNombre,
  ];

  const result = await pool.query(query, params);
  return result.rows[0];
};

const obtenerEntradas = async () => {
  const query = `
    SELECT id, titulo, descripcion, tipo, creado_en, autor_nombre
    FROM bitacora
    ORDER BY creado_en DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const actualizarEntrada = async (id, datos) => {
  const { titulo, descripcion, tipo } = datos;

  const query = `
    UPDATE bitacora
    SET titulo = $1, descripcion = $2, tipo = $3
    WHERE id = $4
    RETURNING *
  `;

  const params = [titulo.trim(), descripcion.trim(), tipo || "General", id];

  const result = await pool.query(query, params);

  if (result.rows.length === 0) {
    throw new Error("Entrada de bitacora no encontrada");
  }
  return result.rows[0];
};

const borrarEntrada = async (id) => {
  const query = "DELETE FROM bitacora WHERE id = $1 RETURNING *";
  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    throw new Error("Entrada de bitácora no encontrada");
  }
  return { message: "Entrada de bitácora eliminada" };
};

module.exports = {
  crearEntrada,
  obtenerEntradas,
  actualizarEntrada,
  borrarEntrada,
};
