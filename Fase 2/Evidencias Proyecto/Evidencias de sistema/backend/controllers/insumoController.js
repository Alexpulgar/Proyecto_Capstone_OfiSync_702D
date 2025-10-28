const pool = require("../models/db");

// Agregar nuevo insumo
const agregarInsumo = async (req, res) => {
  try {
    const { nombre, categoria, estado } = req.body;

    const stock = parseInt(req.body.stock, 10);
    const stock_minimo = parseInt(req.body.stock_minimo, 10);

    // Validación de campos obligatorios
    if (!nombre || req.body.stock === "" || req.body.stock_minimo === "") {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }
    if (isNaN(stock) || isNaN(stock_minimo)) {
      return res.status(400).json({ error: "El stock debe ser numerico" });
    }

    // Reglas de negocio
    if (stock < 0)
      return res.status(400).json({ error: "El stock no puede ser negativo" });
    if (stock_minimo < 0)
      return res.status(400).json({ error: "El stock mínimo no puede ser negativo" });

    // Evitar duplicado de nombre + categoría
    const checkQuery = `
      SELECT * FROM insumo
      WHERE LOWER(nombre) = LOWER($1)
      AND LOWER(COALESCE(categoria, '')) = LOWER(COALESCE($2, ''))
    `;
    const checkResult = await pool.query(checkQuery, [nombre, categoria]);

    if (checkResult.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Ya existe un insumo con ese nombre en la misma categoría" });
    }

    // Si el stock es 0, forzar "inactivo". Si no, usar el estado enviado o "activo" por defecto.
    const estadoFinal = stock === 0 ? "inactivo" : (estado || "activo");

    const query = `
      INSERT INTO insumo (nombre, categoria, stock, stock_minimo, estado)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const params = [
      nombre.trim(),
      categoria || null,
      stock,
      stock_minimo,
      estadoFinal, // Usar el estado final determinado
    ];
    const result = await pool.query(query, params);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error al agregar Insumo:", err);
    res.status(500).json({ error: "Error al agregar Insumo" });
  }
};

// Obtener todos los insumos
const obtenerInsumos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, categoria, stock, stock_minimo, estado, creado_en, actualizado_en
      FROM insumo
      ORDER BY nombre
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener Insumos:", err);
    res.status(500).json({ error: "Error al obtener Insumos" });
  }
};

// Obtener un insumo por ID
const obtenerInsumoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "SELECT * FROM insumo WHERE id = $1";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Insumo no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al obtener Insumo:", err);
    res.status(500).json({ error: "Error al obtener Insumo" });
  }
};

// Actualizar un insumo
const actualizarInsumo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria, stock, stock_minimo, estado } = req.body;

    // Verificar existencia
    const checkExist = await pool.query("SELECT * FROM insumo WHERE id = $1", [id]);
    if (checkExist.rows.length === 0) {
      return res.status(404).json({ error: "Insumo no encontrado" });
    }

    const actual = checkExist.rows[0];

    // Aplicar valores nuevos o mantener los actuales
    const newNombre = nombre ? nombre.trim() : actual.nombre;
    const newCategoria =
      categoria !== undefined ? categoria : actual.categoria;
    const newStock = stock !== undefined ? stock : actual.stock;
    const newStockMinimo =
      stock_minimo !== undefined ? stock_minimo : actual.stock_minimo;

    let newEstado;

    if (newStock === 0) {
      // Caso 1: Si el stock nuevo es 0, forzar "inactivo".
      newEstado = "inactivo";
    } else {
      // Caso 2: El stock nuevo es > 0.
      if (estado !== undefined) {
        // Si el usuario manda un estado (ej: "activo", "pausado"), usar ese.
        newEstado = estado;
      } else {
        // Si el usuario no mandó estado, verificar el estado actual.
        if (actual.estado === "inactivo") {
          // Si estaba "inactivo" (por stock 0), reactivarlo automáticamente.
          newEstado = "activo";
        } else {
          // Si estaba "activo" o "pausado", mantener ese estado.
          newEstado = actual.estado;
        }
      }
    }

    // Validaciones de negocio
    if (newStock < 0)
      return res.status(400).json({ error: "El stock no puede ser negativo" });
    if (newStockMinimo < 0)
      return res.status(400).json({ error: "El stock mínimo no puede ser negativo" });

    // No permitir inactivar con stock > 0
    // (Esta regla previene que el usuario ponga "inactivo" manualmente si hay stock)
    if (newEstado === "inactivo" && newStock > 0) {
      return res.status(400).json({
        error: "No puedes inactivar un insumo con stock mayor a cero",
      });
    }

    // Validar duplicado nombre + categoría (excepto el mismo id)
    const duplicateQuery = `
      SELECT * FROM insumo
      WHERE LOWER(nombre) = LOWER($1)
      AND LOWER(COALESCE(categoria, '')) = LOWER(COALESCE($2, ''))
      AND id <> $3
    `;
    const duplicateCheck = await pool.query(duplicateQuery, [
      newNombre,
      newCategoria,
      id,
    ]);

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        error: "Ya existe otro insumo con ese nombre en la misma categoría",
      });
    }

    const updateQuery = `
      UPDATE insumo
      SET nombre = $1,
          categoria = $2,
          stock = $3,
          stock_minimo = $4,
          estado = $5
      WHERE id = $6
      RETURNING *
    `;
    const params = [
      newNombre,
      newCategoria,
      newStock,
      newStockMinimo,
      newEstado,
      id,
    ];
    const result = await pool.query(updateQuery, params);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al actualizar Insumo:", err);
    res.status(500).json({ error: "Error al actualizar Insumo" });
  }
};

// Eliminar un insumo
const eliminarInsumo = async (req, res) => {
  try {
    const { id } = req.params;

    const check = await pool.query("SELECT * FROM insumo WHERE id = $1", [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Insumo no encontrado" });
    }

    const query = `DELETE FROM insumo WHERE id = $1`;
    await pool.query(query, [id]);

    res.json({
      mensaje: "Insumo eliminado correctamente",
    });
  } catch (err) {
    console.error("Error al eliminar Insumo:", err);
    res.status(500).json({ error: "Error al eliminar Insumo" });
  }
};

module.exports = {
  agregarInsumo,
  obtenerInsumos,
  obtenerInsumoPorId,
  actualizarInsumo,
  eliminarInsumo,
};