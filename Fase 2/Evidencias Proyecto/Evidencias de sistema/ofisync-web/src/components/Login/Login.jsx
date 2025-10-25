import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Asegúrate de importar loginApi y getUsuario
import { loginApi, getUsuario } from '../../../services/usuarioService'; // Ajusta la ruta si es necesario
import './Login.css'; // Asumiendo que tienes Login.css en la misma carpeta

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nombre_usuario: '',
        contrasena: ''
    });
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(''); 

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError(''); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); 

        if (!form.nombre_usuario || !form.contrasena) {
            setError("Nombre de usuario y contraseña son obligatorios.");
            return;
        }

        try {
            setCargando(true);
            // Llama a loginApi, que guarda el token y los datos del usuario en localStorage
            const loginData = await loginApi(form); 
            
            // --- INICIO DE LA MODIFICACIÓN ---
            // Obtenemos el usuario recién logueado (incluye el rol)
            // loginData.usuario ya tiene la info que necesitamos
            const usuarioLogueado = loginData.usuario; 

            // Verificamos el rol y redirigimos
            if (usuarioLogueado.rol === 'conserje') {
                navigate('/bitacora'); // Redirige al conserje a Bitácora
            } else {
                navigate('/inicio'); // Redirige a cualquier otro rol (admin) a Inicio
            }
            // --- FIN DE LA MODIFICACIÓN ---

        } catch (err) {
            setError(err.message); 
        } finally {
            setCargando(false);
        }
    };

    return (
        // (El JSX del return se mantiene igual que antes)
        <div className="login-container">
            <div className="login-box">
                {/* <img src="/img/LogoOfisync.png" alt="OfiSync Logo" className="login-logo" /> */}
                <h2>Iniciar Sesión</h2>
                <form onSubmit={handleSubmit}>
                    <div className="login-form-group">
                        <label htmlFor="nombre_usuario">Nombre de Usuario</label>
                        <input 
                            id="nombre_usuario" 
                            type="text" 
                            name="nombre_usuario" 
                            value={form.nombre_usuario} 
                            onChange={handleChange}
                            required 
                        />
                    </div>
                    <div className="login-form-group">
                        <label htmlFor="contrasena">Contraseña</label>
                        <input 
                            id="contrasena" 
                            type="password" 
                            name="contrasena" 
                            value={form.contrasena} 
                            onChange={handleChange}
                            required 
                        />
                    </div>
                    
                    {error && <p className="login-error">{error}</p>}

                    <button type="submit" className="login-button" disabled={cargando}>
                        {cargando ? 'Ingresando...' : 'Ingresar'}
                    </button>
                    
                </form>
            </div>
        </div>
    );
}

export default Login;