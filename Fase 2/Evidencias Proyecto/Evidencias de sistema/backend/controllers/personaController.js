const pool = require("../models/db.js");

// Obtener todas las personas
const obtenerPersonas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre
      FROM persona
      ORDER BY nombre
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener personas:", err);
    res.status(500).json({ error: "Error al obtener personas" });
  }
};

const agregarPersona = async (req, res) => {
  try {
    const { rut, nombre, correo, telefono } = req.body;

    // --- VALIDACIONES INTEGRADAS DIRECTAMENTE EN EL CONTROLADOR ---

    // 1. Validar que todos los campos obligatorios existan
    if (!rut || !nombre || !correo || !telefono) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // 2. Validación de formato de RUT
    if (!/^\d{7,8}-[0-9kK]$/.test(rut)) {
      return res.status(400).json({ error: "El RUT debe tener el formato 12345678-9" });
    }

    // 3. Validación de formato de Nombre
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
      return res.status(400).json({ error: "El nombre solo puede contener letras y espacios" });
    }

    // 4. Validación de formato de Correo
    if (!/\S+@\S+\.\S+/.test(correo)) {
      return res.status(400).json({ error: "Correo electrónico no válido" });
    }
    
    // 5. Validación de largo de Teléfono
    if (telefono.length < 8 || telefono.length > 12) {
      return res.status(400).json({ error: "El teléfono debe tener entre 8 y 12 dígitos" });
    }

    // --- FIN DE LAS VALIDACIONES ---


    // Validar si ya existe una persona con el mismo Rut en la BD
    const checkQuery = "SELECT * FROM persona WHERE rut = $1";
    const checkResult = await pool.query(checkQuery, [rut]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: "El rut ingresado ya existe en el sistema.." });
    }
    
    // Si todas las validaciones pasan, insertar en la base de datos
    const query = `
      INSERT INTO persona (nombre, correo, telefono, rut)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const params = [nombre, correo, telefono, rut];
    const result = await pool.query(query, params);

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("Error al agregar Arrendatario:", err);
    res.status(500).json({ error: "Error al agregar Arrendatario" });
  }
};

module.exports = { obtenerPersonas, agregarPersona };