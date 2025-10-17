const pool = require("../models/db.js"); // conexión a BD

// Buscar oficinas
const buscarOficinas = async (req, res) => {
  try {
    const { codigo, piso, estado, arrendatario } = req.query;

    let query = `
      SELECT 
        o.codigo AS oficina,
        o.area,
        o.estado,
        per.nombre AS arrendatario,
        p.numero_piso,
        e.nombre AS edificio
      FROM oficina o
      JOIN piso p ON o.piso_id = p.id
      JOIN edificio e ON p.edificio_id = e.id
      LEFT JOIN persona per ON o.persona_id = per.id
      WHERE 1=1
    `;

    const params = [];
    let count = 1;

    if (codigo) {
      query += ` AND o.codigo = $${count++}`;
      params.push(codigo);
    }

    if (piso) {
      query += ` AND p.numero_piso = $${count++}`;
      params.push(piso);
    }

    if (estado) {
      query += ` AND o.estado = $${count++}`;
      params.push(estado);
    }

    if (arrendatario) {
      query += ` AND unaccent(per.nombre) ILIKE unaccent($${count++})`;
      params.push(`%${arrendatario}%`);
    }

    query += " ORDER BY p.numero_piso, o.codigo";

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (err) {
    console.error("Error al buscar oficinas:", err);
    res.status(500).json({ error: "Error al buscar oficinas" });
  }
};

// Mostrar todas las oficinas
const obtenerOficinas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.nombre AS edificio,
        p.numero_piso,
        o.codigo AS oficina,
        o.area,
        o.estado,
        per.nombre AS arrendatario
      FROM edificio e
      JOIN piso p ON p.edificio_id = e.id
      JOIN oficina o ON o.piso_id = p.id
      LEFT JOIN persona per ON o.persona_id = per.id
      ORDER BY p.numero_piso, o.codigo
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener oficinas:", err);
    res.status(500).json({ error: "Error al obtener oficinas" });
  }
};

// Agregar oficina
const agregarOficina = async (req, res) => {
  try {
    const { codigo, piso_id, area, estado = "libre", persona_id = null, edificio_id } = req.body;

    // Validar campos obligatorios
    if (!codigo || !piso_id || !area || !edificio_id) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Validar que el código sea un número
    if (isNaN(codigo)) {
      return res.status(400).json({ error: "El código debe ser un número." });
    }

    // Validar que el código no sea muy largo
    if (codigo.toString().length > 6) {
      return res.status(400).json({ error: "El código no puede tener más de 6 dígitos." });
    }

    // Validar que el código sea positivo
    if (Number(codigo) <= 0) {
      return res.status(400).json({ error: "El código debe ser un número positivo" });
    }

    // Validar que el área sea positiva
    if (isNaN(area) || Number(area) <= 0) {
      return res.status(400).json({ error: "El área(m²) debe ser un número positivo" });
    }

    //  validación: si está ocupada debe tener arrendatario
    if (estado.toLowerCase() === "ocupada" && (!persona_id || persona_id === null)) {
      return res.status(400).json({
        error: "Debe asignar un arrendatario cuando la oficina está ocupada.",
      });
    }

    // Validar si ya existe una oficina con el mismo código en el mismo edificio
    const checkQuery = `
      SELECT o.*
      FROM oficina o
      JOIN piso p ON o.piso_id = p.id
      WHERE o.codigo = $1 AND p.edificio_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [codigo, edificio_id]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: "Ya existe una oficina con ese código en este edificio" });
    }

    // Insertar la oficina
    const query = `
      INSERT INTO oficina (codigo, piso_id, area, estado, persona_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const params = [codigo, piso_id, area, estado, persona_id];
    const result = await pool.query(query, params);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error al agregar oficina:", err);
    res.status(500).json({ error: "Error al agregar oficina" });
  }
};

module.exports = { buscarOficinas, obtenerOficinas, agregarOficina };




module.exports = { buscarOficinas, obtenerOficinas, agregarOficina  };






