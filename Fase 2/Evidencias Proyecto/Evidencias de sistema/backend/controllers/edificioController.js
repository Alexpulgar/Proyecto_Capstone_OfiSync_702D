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


const actualizarEdificio = async (req, res) => {
  try {
    // 1. Obtener el ID de los parámetros de la URL
    const { id } = req.params;
    // 2. Obtener los datos del body
    const { nombre, pisos_totales, area_bruta_por_piso, area_comun_pct } = req.body;

    // 3. Validar el ID
    const edificioId = parseInt(id, 10);
    if (isNaN(edificioId)) {
      return res.status(400).json({ error: "ID de edificio no válido" });
    }

    // 4. Validar datos obligatorios (igual que en agregar)
    if (!nombre || !pisos_totales || !area_bruta_por_piso || !area_comun_pct) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // 5. Verificar si el nuevo nombre ya existe EN OTRO edificio
    //    (Igual que tu verificación de 'agregar', pero excluyendo el ID actual)
    const checkQuery = "SELECT * FROM edificio WHERE LOWER(nombre) = LOWER($1) AND id != $2";
    const checkResult = await pool.query(checkQuery, [nombre, edificioId]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: "Ya existe otro edificio con ese nombre" });
    }

    // 6. Crear la consulta SQL de actualización
    const query = `
        UPDATE edificio
        SET nombre = $1,
            pisos_totales = $2,
            area_bruta_por_piso = $3,
            area_comun_pct = $4
        WHERE id = $5
        RETURNING *
    `;
    
    // 7. Definir los parámetros (el ID va al final, $5)
    const params = [nombre, pisos_totales, area_bruta_por_piso, area_comun_pct, edificioId];

    // 8. Ejecutar la consulta
    const result = await pool.query(query, params);

    // 9. Verificar si se actualizó la fila (si no, el ID no existía)
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Edificio no encontrado" });
    }

    // 10. Devolver el edificio actualizado
    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error("Error al actualizar Edificio: ", err);
    res.status(500).json({ error: "Error al actualizar Edificio" });
  }
};

const obtenerEdificioPorId = async (req, res) => {
  try {
    // 1. Obtener el ID de los parámetros de la URL
    const { id } = req.params;

    // 2. Validar el ID
    const edificioId = parseInt(id, 10);
    if (isNaN(edificioId)) {
      return res.status(400).json({ error: "ID de edificio no válido" });
    }

    // 3. Crear la consulta SQL
    const query = "SELECT * FROM edificio WHERE id = $1";
    
    // 4. Ejecutar la consulta
    const result = await pool.query(query, [edificioId]);

    // 5. Verificar si se encontró el edificio
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Edificio no encontrado" });
    }

    // 6. Devolver el edificio encontrado
    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error("Error al obtener Edificio por ID: ", err);
    res.status(500).json({ error: "Error al obtener Edificio" });
  }
};

module.exports = { agregarEdificio, obtenerEdificios, actualizarEdificio, obtenerEdificioPorId}