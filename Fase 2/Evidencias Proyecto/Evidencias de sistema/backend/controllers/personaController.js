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

const obtenerPersonaPorRut = async (req, res) => {
  try {
    const { rut } = req.params;

    // Validar que el RUT venga en la URL
    if (!rut) {
      return res.status(400).json({ error: "Falta el parámetro RUT" });
    }

    const query = "SELECT * FROM persona WHERE rut = $1";
    const result = await pool.query(query, [rut]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Persona no encontrada con ese RUT" });
    }

    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error("Error al obtener persona por RUT: ", err);
    res.status(500).json({ error: "Error al obtener persona" });
  }
};

const actualizarPersonaParcial = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { correo, telefono } = req.body;

    const personaId = parseInt(id, 10);
    if (isNaN(personaId)) {
      return res.status(400).json({ error: "ID de persona no válido" });
    }

    // Validamos 'correo'
    if (!correo || !telefono) {
      return res.status(400).json({ error: "Faltan correo o teléfono" });
    }

    const query = `
      UPDATE persona
      SET correo = $1,   -- <-- CAMBIO CLAVE AQUÍ
          telefono = $2
      WHERE id = $3
      RETURNING *
    `;
    
    const params = [correo, telefono, personaId];
    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Persona no encontrada para actualizar" });
    }

    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error("Error al actualizar persona: ", err);
    res.status(500).json({ error: "Error al actualizar persona" });
  }
}

const eliminarPersona = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validar el ID
    const personaId = parseInt(id, 10);
    if (isNaN(personaId)) {
      return res.status(400).json({ error: "Rut de persona no válido" });
    }

    // 2. Verificar si la persona es arrendatario en una oficina
    const checkOficinaQuery = "SELECT COUNT(*) FROM oficina WHERE persona_id = $1";
    const checkOficinaResult = await pool.query(checkOficinaQuery, [personaId]);
    
    if (parseInt(checkOficinaResult.rows[0].count, 10) > 0) {
      // Si está asociada, no se puede eliminar
      return res.status(400).json({ 
        error: "No se puede eliminar la persona porque está asignada como arrendatario a una oficina." 
      });
    }

    // 3. Si no está asociada, proceder a eliminar
    const query = "DELETE FROM persona WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [personaId]);

    // 4. Verificar si se eliminó algo
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Arrendatario no encontrado para eliminar" });
    }

    // 5. Devolver éxito
    res.status(200).json({ message: "Arrendatario eliminad correctamente" });

  } catch (err) {
    console.error("Error al eliminar Arrendatario: ", err);
    res.status(500).json({ error: "Error al eliminar Arrendatario" });
  }
};

module.exports = { obtenerPersonas, agregarPersona, obtenerPersonaPorRut,actualizarPersonaParcial,eliminarPersona};