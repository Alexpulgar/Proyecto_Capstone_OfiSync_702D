const pool = require("../models/db.js");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// registrarUsuario
const registrarUsuario = async (req, res) => {
    try {
        const { nombre_usuario, contrasena, rol = 'usuario', persona_id = null } = req.body;
        if (!nombre_usuario || !contrasena) {
            return res.status(400).json({ error: "Nombre de usuario y contraseña son obligatorios." });
        }
        if (contrasena.length < 6) {
             return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
        }
        if (rol === 'usuario' && !persona_id) {
            return res.status(400).json({ error: "Debe seleccionar una persona para asignar a la cuenta de rol 'Usuario'." });
        }
        const checkUser = await pool.query("SELECT * FROM usuarios WHERE LOWER(nombre_usuario) = LOWER($1)", [nombre_usuario]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ error: "El nombre de usuario ya está en uso." });
        }
        if (rol === 'usuario' && persona_id) {
            const checkPersona = await pool.query("SELECT * FROM usuarios WHERE persona_id = $1", [persona_id]);
            if (checkPersona.rows.length > 0) {
                 return res.status(400).json({ error: "Esta persona ya tiene una cuenta de usuario asignada." });
            }
        }
        const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);
        const query = `
            INSERT INTO usuarios (nombre_usuario, contrasena_hash, rol, persona_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, nombre_usuario, rol, persona_id
        `;
        const persona_id_to_insert = rol === 'usuario' ? persona_id : null;
        const result = await pool.query(query, [nombre_usuario, contrasenaHash, rol, persona_id_to_insert]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error al registrar usuario: ", err);
        if (err.code === '23503') {
             return res.status(400).json({ error: "La persona seleccionada no existe o no es válida." });
        }
        res.status(500).json({ error: "Error interno al registrar el usuario." });
    }
};

// loginUsuario
const loginUsuario = async (req, res) => {
    try {
        const { nombre_usuario, contrasena } = req.body;
        if (!nombre_usuario || !contrasena) {
            return res.status(400).json({ error: "Nombre de usuario y contraseña son obligatorios." });
        }
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
        let oficinaId = null;
        if (usuario.rol === 'usuario' && usuario.persona_id) {
            const oficinaQuery = "SELECT id FROM oficina WHERE persona_id = $1";
            const oficinaResult = await pool.query(oficinaQuery, [usuario.persona_id]);
            if (oficinaResult.rows.length > 0) {
                oficinaId = oficinaResult.rows[0].id;
            }
        }
        const payload = {
            id: usuario.id,
            persona_id: usuario.persona_id,
            nombre_usuario: usuario.nombre_usuario,
            rol: usuario.rol,
            oficina_id: oficinaId
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
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

// Solicitar Código de Reseteo
const solicitarCodigoReseteo = async (req, res) => {
    const { id: userId, persona_id: personaId } = req.user;

    if (!personaId) {
        return res.status(400).json({ error: "Esta cuenta de usuario no está asociada a una persona y correo." });
    }

    try {
        const personaQuery = await pool.query("SELECT correo FROM persona WHERE id = $1", [personaId]);
        const email = personaQuery.rows[0]?.correo;

        if (!email) {
            return res.status(400).json({ error: "No se encontró un correo electrónico asociado a esta cuenta." });
        }

        const code = crypto.randomInt(100000, 999999).toString();
        const codeHash = await bcrypt.hash(code, saltRounds);
        const expires = new Date(Date.now() + 10 * 60 * 1000); 

        await pool.query(
            "UPDATE usuarios SET reset_token = $1, reset_token_expires = $2 WHERE id = $3",
            [codeHash, expires, userId]
        );

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Soporte OfiSync" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Tu código de recuperación de contraseña de OfiSync',
            text: `Tu código de recuperación es: ${code}\n\nExpira en 10 minutos.`,
            html: `<p>Tu código de recuperación es: <b>${code}</b></p><p>Expira en 10 minutos.</p>`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: `Código enviado a ${email}` });

    } catch (err) {
        console.error("Error al solicitar código:", err);
        res.status(500).json({ error: "Error interno al enviar el código." });
    }
};

// Verificar Código
const verificarCodigoReseteo = async (req, res) => {
    const { id: userId } = req.user;
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: "El código es obligatorio." });
    }

    try {
        const userQuery = await pool.query(
            "SELECT reset_token, reset_token_expires FROM usuarios WHERE id = $1",
            [userId]
        );
        const user = userQuery.rows[0];

        if (!user || !user.reset_token) {
            return res.status(400).json({ error: "Código inválido o no solicitado." });
        }

        if (new Date(user.reset_token_expires) < new Date()) {
            return res.status(400).json({ error: "El código ha expirado. Solicita uno nuevo." });
        }

        const isMatch = await bcrypt.compare(code, user.reset_token);

        if (!isMatch) {
            return res.status(400).json({ error: "Código incorrecto." });
        }

        res.status(200).json({ message: "Código verificado correctamente." });

    } catch (err) {
        console.error("Error al verificar código:", err);
        res.status(500).json({ error: "Error interno al verificar el código." });
    }
};

// Actualizar Contraseña con Código
const actualizarPasswordConCodigo = async (req, res) => {
    const { id: userId } = req.user;
    const { code, newPassword } = req.body;

    if (!code || !newPassword) {
        return res.status(400).json({ error: "El código y la nueva contraseña son obligatorios." });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres." });
    }

    try {
        const userQuery = await pool.query(
            "SELECT reset_token, reset_token_expires FROM usuarios WHERE id = $1",
            [userId]
        );
        const user = userQuery.rows[0];

        if (!user || !user.reset_token) {
            return res.status(400).json({ error: "Código inválido, expirado o ya utilizado." });
        }
        if (new Date(user.reset_token_expires) < new Date()) {
            return res.status(400).json({ error: "El código ha expirado." });
        }
        
        const isMatch = await bcrypt.compare(code, user.reset_token);
        if (!isMatch) {
            return res.status(400).json({ error: "Código incorrecto." });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        await pool.query(
            "UPDATE usuarios SET contrasena_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2",
            [newPasswordHash, userId]
        );

        res.status(200).json({ message: "Contraseña actualizada con éxito." });

    } catch (err) {
        console.error("Error al actualizar contraseña:", err);
        res.status(500).json({ error: "Error interno al actualizar la contraseña." });
    }
};

module.exports = {
    registrarUsuario,
    loginUsuario,
    solicitarCodigoReseteo,
    verificarCodigoReseteo,
    actualizarPasswordConCodigo,
};