import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarUsuarioApi } from '../../../services/usuarioService'; // Verifica que la ruta sea correcta


function CrearUsuario() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nombre_usuario: '',
        contrasena: '',
        confirmarContrasena: '',
        rol: 'usuario' // Rol por defecto
    });
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- Validaciones Frontend ---
        if (!form.nombre_usuario || !form.contrasena || !form.confirmarContrasena) {
            alert("Todos los campos son obligatorios.");
            return;
        }
        if (form.contrasena !== form.confirmarContrasena) {
            alert("Las contraseñas no coinciden.");
            return;
        }
         if (form.contrasena.length < 6) { 
            alert("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        // --- Fin Validaciones ---

        try {
            setCargando(true);
            // Preparamos los datos a enviar (sin confirmarContrasena)
            const datosParaApi = {
                nombre_usuario: form.nombre_usuario,
                contrasena: form.contrasena,
                rol: form.rol
            };

            const data = await registrarUsuarioApi(datosParaApi);
            
            alert(`Usuario "${data.nombre_usuario}" creado con éxito con rol "${data.rol}".`);
            
            // Limpiar formulario después del éxito
            setForm({ nombre_usuario: '', contrasena: '', confirmarContrasena: '', rol: 'usuario' }); 
            // navigate('/login'); // Opcional: Redirigir a login u otra página

        } catch (err) {
            // Muestra el error específico que viene del backend
            alert("Error al crear usuario: " + err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        // Usamos las clases de 'agregar.css'
        <div className="contenedorAgregar"> 
            <h2>Crear Nueva Cuenta de Usuario</h2>
            <form onSubmit={handleSubmit} className="agregar-form">
                
                {/* Nombre de Usuario */}
                <div className="form-group">
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

                {/* Selector de Rol */}
                <div className="form-group"> 
                    <label htmlFor="rol">Rol</label>
                    <select 
                        id="rol" 
                        name="rol" 
                        value={form.rol} 
                        onChange={handleChange}
                    >
                        <option value="usuario">Usuario</option>
                        <option value="admin">Administrador</option>
                        <option value="conserje">Conserje</option>
                        <option value="personalAseo">Personal de aseo</option>
                        {/* Puedes añadir más roles si los definiste en tu BD */}
                    </select>
                </div>

                {/* Contraseña */}
                <div className="form-group">
                    <label htmlFor="contrasena">Contraseña (mín. 6 caracteres)</label>
                    <input 
                        id="contrasena" 
                        type="password" 
                        name="contrasena" 
                        value={form.contrasena} 
                        onChange={handleChange}
                        required 
                    />
                </div>
                
                {/* Confirmar Contraseña */}
                <div className="form-group">
                    <label htmlFor="confirmarContrasena">Confirmar Contraseña</label>
                    <input 
                        id="confirmarContrasena" 
                        type="password" 
                        name="confirmarContrasena" 
                        value={form.confirmarContrasena} 
                        onChange={handleChange}
                        required 
                    />
                </div>

                {/* Botón de envío */}
                <div className="form-group span-full"> {/* span-full para ocupar todo el ancho */}
                    <button type="submit" disabled={cargando}>
                        {cargando ? 'Creando Usuario...' : 'Crear Usuario'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CrearUsuario;