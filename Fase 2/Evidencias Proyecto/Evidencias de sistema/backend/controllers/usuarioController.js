const pool = require("../models/db.js");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const registrarUsuario = async (req, res) => {
    try {
        // --- 1. Recibir persona_id ---
        const { nombre_usuario, contrasena, rol = 'usuario', persona_id = null } = req.body;

        // --- Validaciones básicas ---
        if (!nombre_usuario || !contrasena) {
            return res.status(400).json({ error: "Nombre de usuario y contraseña son obligatorios." });
        }
        if (contrasena.length < 6) {
             return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
        }
        // --- 2. Validación de persona_id para rol 'usuario' ---
        if (rol === 'usuario' && !persona_id) {
            return res.status(400).json({ error: "Debe seleccionar una persona para asignar a la cuenta de rol 'Usuario'." });
        }
        // --- Fin Validaciones ---

        // Verificar si el usuario ya existe
        const checkUser = await pool.query("SELECT * FROM usuarios WHERE LOWER(nombre_usuario) = LOWER($1)", [nombre_usuario]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ error: "El nombre de usuario ya está en uso." });
        }
        
        // --- 3. Verificar si la persona ya está asignada a otro usuario (si aplica) ---
        if (rol === 'usuario' && persona_id) {
            const checkPersona = await pool.query("SELECT * FROM usuarios WHERE persona_id = $1", [persona_id]);
            if (checkPersona.rows.length > 0) {
                 return res.status(400).json({ error: "Esta persona ya tiene una cuenta de usuario asignada." });
            }
        }

        // Hashear la contraseña
        const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);
        // Insertar el nuevo usuario en la base de datos
        const query = `
            INSERT INTO usuarios (nombre_usuario, contrasena_hash, rol, persona_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, nombre_usuario, rol, persona_id
        `;
        // Si el rol no es 'usuario', persona_id_to_insert será null
        const persona_id_to_insert = rol === 'usuario' ? persona_id : null;
        const result = await pool.query(query, [nombre_usuario, contrasenaHash, rol, persona_id_to_insert]);
        // ------------------------------------------------------

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error("Error al registrar usuario: ", err);
        if (err.code === '23503') { // Código de error de PostgreSQL para foreign key violation
             return res.status(400).json({ error: "La persona seleccionada no existe o no es válida." });
        }
        res.status(500).json({ error: "Error interno al registrar el usuario." });
    }
};

const loginUsuario = async (req, res) => {
    try {
        const { nombre_usuario, contrasena } = req.body;

        if (!nombre_usuario || !contrasena) {
            return res.status(400).json({ error: "Nombre de usuario y contraseña son obligatorios." });
        }

        // Buscar usuario
        const userQuery = "SELECT id, nombre_usuario, contrasena_hash, rol, persona_id FROM usuarios WHERE LOWER(nombre_usuario) = LOWER($1)";
        const userResult = await pool.query(userQuery, [nombre_usuario]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Credenciales inválidas." });
        }

        const usuario = userResult.rows[0];

        const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);

        if (!contrasenaValida) {
            return res.status(401).json({ error: "Credenciales inválidas." });
        }

        // Buscar oficina_id
        let oficinaId = null;
        if (usuario.rol === 'usuario' && usuario.persona_id) {
            const oficinaQuery = "SELECT id FROM oficina WHERE persona_id = $1";
            const oficinaResult = await pool.query(oficinaQuery, [usuario.persona_id]);

            if (oficinaResult.rows.length > 0) {
                oficinaId = oficinaResult.rows[0].id;
            }
        }

        // Generar el token JWT
        const payload = {
            id: usuario.id,
            persona_id: usuario.persona_id,
            nombre_usuario: usuario.nombre_usuario,
            rol: usuario.rol,
            oficina_id: oficinaId
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // Enviar el token y los datos del usuario
        res.status(200).json({
            message: "Login exitoso",
            token: token,
            usuario: payload
         });

    } catch (err) {
        console.error("Error en el login: ", err);
        res.status(500).json({ error: "Error interno durante el login." });
    }
};

module.exports = { registrarUsuario, loginUsuario };