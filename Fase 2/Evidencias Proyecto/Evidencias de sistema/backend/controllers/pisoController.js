const pool = require("../models/db.js");// conexión a BD

// Obtener todos los pisos
const obtenerPisos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, numero_piso, edificio_id
      FROM piso
      ORDER BY edificio_id, numero_piso
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener pisos:", err);
    res.status(500).json({ error: "Error al obtener pisos" });
  }
};

const obtenerPisosPorEdificio = async (req, res) => {
  const { edificio_id } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM piso WHERE edificio_id = $1 ORDER BY numero_piso",
      [edificio_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener pisos por edificio:", err);
    res.status(500).json({ error: "Error al obtener pisos por edificio" });
  }
};

// Agregar un nuevo piso
const agregarPiso = async (req, res) => {
  try {
    const { edificio_id, cantidad } = req.body;

    if (!edificio_id || !cantidad) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Obtener datos del edificio
    const edificioQuery = "SELECT * FROM edificio WHERE id = $1";
    const edificioResult = await pool.query(edificioQuery, [edificio_id]);

    if (edificioResult.rows.length === 0) {
      return res.status(404).json({ error: "El edificio no existe" });
    }

    const edificio = edificioResult.rows[0];

    // Contar cuántos pisos ya tiene el edificio
    const countQuery = "SELECT COUNT(*) FROM piso WHERE edificio_id = $1";
    const countResult = await pool.query(countQuery, [edificio_id]);
    const pisosActuales = parseInt(countResult.rows[0].count);

    // Validar que no supere el máximo de pisos
    if (pisosActuales + cantidad > edificio.pisos_totales) {
      return res.status(400).json({
        error: `No puedes agregar ${cantidad} pisos. El edificio solo permite ${edificio.pisos_totales} en total.`,
      });
    }

    const pisosAgregados = [];

    // Calcular áreas por piso
    const areaBruta = parseFloat(edificio.area_bruta_por_piso);
    const areaComun = (areaBruta * parseFloat(edificio.area_comun_pct)) / 100;
    const areaUtil = areaBruta - areaComun;

    // Insertar los pisos uno por uno
    for (let i = 1; i <= cantidad; i++) {
      const numeroPiso = pisosActuales + i;

      const insertQuery = `
        INSERT INTO piso (edificio_id, numero_piso, area_bruta, area_comun, area_util)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const insertValues = [
        edificio_id,
        numeroPiso,
        areaBruta,
        areaComun,
        areaUtil,
      ];

      const result = await pool.query(insertQuery, insertValues);
      pisosAgregados.push(result.rows[0]);
    }

    res.status(201).json({
      mensaje: `Se agregaron ${pisosAgregados.length} piso(s) correctamente.`,
      pisos: pisosAgregados,
    });
  } catch (err) {
    console.error("Error al agregar pisos:", err);
    res.status(500).json({ error: "Error al agregar pisos" });
  }
};

const eliminarPisosPorCantidad = async (req, res) => {
  try {
    const { edificio_id, cantidad_a_borrar } = req.body;

    // 1. Validar IDs
    const edificioId = parseInt(edificio_id, 10);
    const cantidad = parseInt(cantidad_a_borrar, 10);

    if (isNaN(edificioId) || isNaN(cantidad) || cantidad <= 0) {
      return res.status(400).json({ error: "Datos de entrada no válidos." });
    }

    // 2. Obtener los pisos totales del edificio
    const edificioQuery = "SELECT pisos_totales FROM edificio WHERE id = $1";
    const edificioResult = await pool.query(edificioQuery, [edificioId]);

    if (edificioResult.rows.length === 0) {
      return res.status(404).json({ error: "Edificio no encontrado." });
    }

    const pisosActuales = parseInt(edificioResult.rows[0].pisos_totales, 10);

    // 3. Validar que la cantidad a borrar no sea mayor a los pisos actuales
    if (cantidad > pisosActuales) {
      return res.status(400).json({ 
        error: `No se pueden borrar ${cantidad} pisos, el edificio solo tiene ${pisosActuales}.` 
      });
    }

    // 4. Obtener los IDs de los N pisos más altos (los que se van a borrar)
    const pisosABorrarQuery = `
      SELECT id 
      FROM piso 
      WHERE edificio_id = $1 
      ORDER BY numero_piso DESC 
      LIMIT $2
    `;
    const pisosABorrarResult = await pool.query(pisosABorrarQuery, [edificioId, cantidad]);
    const idsPisosABorrar = pisosABorrarResult.rows.map(p => p.id);

    // 5. Verificar que NINGUNO de esos pisos tenga oficinas
    const checkOficinasQuery = `
      SELECT COUNT(*) 
      FROM oficina 
      WHERE piso_id = ANY($1::int[])
    `;
    const checkOficinasResult = await pool.query(checkOficinasQuery, [idsPisosABorrar]);
    
    if (parseInt(checkOficinasResult.rows[0].count, 10) > 0) {
      return res.status(400).json({ 
        error: "No se pueden borrar los pisos seleccionados porque uno o más de ellos tienen oficinas asociadas. Debe eliminar las oficinas primero." 
      });
    }

    // --- INICIO DE TRANSACCIÓN ---
    // (Usamos una transacción para que si falla un paso, se reviertan todos)
    await pool.query('BEGIN');

    // 6. Si no hay oficinas, proceder a eliminar los pisos
    const deletePisosQuery = "DELETE FROM piso WHERE id = ANY($1::int[])";
    await pool.query(deletePisosQuery, [idsPisosABorrar]);

    // 7. Actualizar el contador en la tabla 'edificio'
    const updateEdificioQuery = `
      UPDATE edificio 
      SET pisos_totales = pisos_totales - $1 
      WHERE id = $2
    `;
    await pool.query(updateEdificioQuery, [cantidad, edificioId]);

    // 8. Confirmar la transacción
    await pool.query('COMMIT');
    // --- FIN DE TRANSACCIÓN ---

    res.status(200).json({ 
      message: `${cantidad} pisos han sido eliminados correctamente del edificio.` 
    });

  } catch (err) {
    // Si algo falló, revertir la transacción
    await pool.query('ROLLBACK');
    console.error("Error al eliminar pisos: ", err);
    res.status(500).json({ error: "Error interno al intentar eliminar los pisos." });
  }
};


module.exports = { obtenerPisos, agregarPiso, obtenerPisosPorEdificio,eliminarPisosPorCantidad };
