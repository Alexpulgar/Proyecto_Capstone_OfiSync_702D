
const pool = require('../../models/db');

const obtenerTodos = async () => {
  // Ordenamos por la columna 'nombre'
  const result = await pool.query(
    'SELECT * FROM insumos ORDER BY nombre ASC'
  );
  return result.rows;
};

const obtenerPorId = async (id) => {
  const result = await pool.query('SELECT * FROM insumos WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    throw new Error('Insumo no encontrado');
  }
  return result.rows[0];
};

const crear = async (datos) => {
  const { nombre, categoria, stock, stock_minimo, estado } = datos;
  const query = `
    INSERT INTO insumos (nombre, categoria, stock, stock_minimo, estado)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const params = [
    nombre.trim(),
    categoria,
    stock,
    stock_minimo,
    estado,
  ];
  const result = await pool.query(query, params);
  return result.rows[0];
};

const actualizar = async (id, datos) => {
  const { nombre, categoria, stock, stock_minimo, estado } = datos;

  const check = await pool.query('SELECT * FROM insumos WHERE id = $1', [id]);
  if (check.rows.length === 0) {
    throw new Error('Insumo no encontrado');
  }

  const query = `
    UPDATE insumos
    SET nombre = $1, categoria = $2, stock = $3, stock_minimo = $4, estado = $5
    WHERE id = $6
    RETURNING *
  `;
  const params = [
    nombre.trim(),
    categoria,
    stock,
    stock_minimo,
    estado,
    id,
  ];
  const result = await pool.query(query, params);
  return result.rows[0];
};

const eliminar = async (id) => {
  const query = 'DELETE FROM insumos WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    throw new Error('Insumo no encontrado');
  }
  return { message: 'Insumo eliminado' };
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};