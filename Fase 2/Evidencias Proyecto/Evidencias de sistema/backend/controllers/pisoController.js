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


module.exports = { obtenerPisos, agregarPiso, obtenerPisosPorEdificio };
