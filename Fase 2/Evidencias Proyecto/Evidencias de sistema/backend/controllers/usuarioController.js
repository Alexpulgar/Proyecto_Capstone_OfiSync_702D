const pool = require("../models/db.js");
const bcrypt = require('bcrypt');
const saltRounds = 10; // Factor de coste para bcrypt

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET 

const registrarUsuario = async (req, res) => {
    try {
        const { nombre_usuario, contrasena, rol = 'usuario' } = req.body; // Rol por defecto 'usuario'

        // --- Validaciones básicas ---
        if (!nombre_usuario || !contrasena) {
            return res.status(400).json({ error: "Nombre de usuario y contraseña son obligatorios." });
        }
        if (contrasena.length < 6) { // Ejemplo: mínimo 6 caracteres
             return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
        }
        // --- Fin Validaciones ---

        // Verificar si el usuario ya existe (insensible a mayúsculas/minúsculas)
        const checkUser = await pool.query("SELECT * FROM usuarios WHERE LOWER(nombre_usuario) = LOWER($1)", [nombre_usuario]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ error: "El nombre de usuario ya está en uso." });
        }

        // Hashear la contraseña
        const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);

        // Insertar en la base de datos
        const query = `
            INSERT INTO usuarios (nombre_usuario, contrasena_hash, rol)
            VALUES ($1, $2, $3)
            RETURNING id, nombre_usuario, rol 
        `; // Devuelve el usuario creado sin la contraseña
        const result = await pool.query(query, [nombre_usuario, contrasenaHash, rol]);

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error("Error al registrar usuario: ", err);
        res.status(500).json({ error: "Error interno al registrar el usuario." });
    }
};

const loginUsuario = async (req, res) => {
    try {
        const { nombre_usuario, contrasena } = req.body;

        if (!nombre_usuario || !contrasena) {
            return res.status(400).json({ error: "Nombre de usuario y contraseña son obligatorios." });
        }

        // 1. Buscar al usuario por nombre_usuario (insensible a mayúsculas/minúsculas)
        const userQuery = "SELECT * FROM usuarios WHERE LOWER(nombre_usuario) = LOWER($1)";
        const userResult = await pool.query(userQuery, [nombre_usuario]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Credenciales inválidas." }); // Error genérico
        }

        const usuario = userResult.rows[0];

        // 2. Comparar la contraseña ingresada con el hash guardado
        const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);

        if (!contrasenaValida) {
            return res.status(401).json({ error: "Credenciales inválidas." }); // Mismo error genérico
        }

        // 3. Si las credenciales son válidas, generar un token JWT
        const payload = {
            id: usuario.id,
            nombre_usuario: usuario.nombre_usuario,
            rol: usuario.rol
        };

        // El token expira en 1 hora (puedes cambiarlo)
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); 

        // 4. Enviar el token al cliente
        res.status(200).json({ 
            message: "Login exitoso",
            token: token,
            usuario: payload // Enviamos también los datos del usuario (sin contraseña)
         });

    } catch (err) {
        console.error("Error en el login: ", err);
        res.status(500).json({ error: "Error interno durante el login." });
    }
};

module.exports = { registrarUsuario, loginUsuario };