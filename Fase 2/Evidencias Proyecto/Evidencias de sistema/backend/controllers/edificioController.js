const pool = require("../models/db.js"); // conexión a BD

const agregarEdificio = async(req, res) =>{
    try{
        const{ nombre, pisos_totales, area_bruta_por_piso, area_comun_pct} = req.body;

        if( !nombre || !pisos_totales || !area_bruta_por_piso || !area_comun_pct )
            return res.status(400).json({ error: "Faltan datos obligatorios" });

        // 🔹 Verificar si ya existe un edificio con el mismo nombre
        const checkQuery = "SELECT * FROM edificio WHERE LOWER(nombre) = LOWER($1)";
        const checkResult = await pool.query(checkQuery, [nombre]);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: "Ya existe un edificio con ese nombre" });
        }

        const query = `
            INSERT INTO edificio (nombre, pisos_totales, area_bruta_por_piso, area_comun_pct)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const params = [nombre, pisos_totales, area_bruta_por_piso, area_comun_pct]
        const result = await pool.query(query, params);

        res.status(201).json(result.rows[0]);

    }catch (err){
        console.error("Error al agregar Edificio: ",err);
        res.status(500).json({error: "Error al agregar Edificio"});
    }
};


const obtenerEdificios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, pisos_totales
      FROM edificio
      ORDER BY nombre
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener edificios:", err);
    res.status(500).json({ error: "Error al obtener edificios" });
  }
};

module.exports = { agregarEdificio, obtenerEdificios}