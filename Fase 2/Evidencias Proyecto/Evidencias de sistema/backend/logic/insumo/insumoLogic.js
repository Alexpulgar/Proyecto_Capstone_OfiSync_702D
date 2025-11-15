
const pool = require('../../models/db');

const obtenerTodos = async () => {
  const result = await pool.query(
    'SELECT * FROM insumo ORDER BY nombre ASC' 
  );
  return result.rows;
};

obtenerPorId = async (id) => {
  const result = await pool.query('SELECT * FROM insumo WHERE id = $1', [id]); 
  if (result.rows.length === 0) {
    throw new Error('Insumo no encontrado');
  }
  return result.rows[0];
};

const crear = async (datos) => {
  const { nombre, categoria, stock, stock_minimo, estado } = datos;
  const query = `
    INSERT INTO insumo (nombre, categoria, stock, stock_minimo, estado)
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

  // Primero, verifica si existe
  const check = await pool.query('SELECT * FROM insumo WHERE id = $1', [id]); 
  if (check.rows.length === 0) {
    throw new Error('Insumo no encontrado');
  }

  const query = `
    UPDATE insumo
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
  const query = 'DELETE FROM insumo WHERE id = $1 RETURNING *'; 
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