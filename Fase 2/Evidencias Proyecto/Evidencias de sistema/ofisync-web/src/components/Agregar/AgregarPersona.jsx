import React, { useState } from "react";
import { agregarPersonaApi } from "../../../services/personaService";
import "./agregar.css"; // Asegúrate de que el CSS esté importado

function AgregarPersona() {
    const [form, setForm] = useState({
        nombre: "",
        correo: "",
        telefono: "",
        rut: ""
    });
    // Estado para guardar los errores de validación
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Función para validar todos los campos del formulario
    const validate = () => {
        const newErrors = {};

        // Validación de RUT
        if (!form.rut) newErrors.rut = "El RUT es obligatorio";
        else if (!/^\d{7,8}-[0-9kK]$/.test(form.rut)) newErrors.rut = "El formato del RUT es incorrecto (Ej: 12345678-9)";

        // Validación de Nombre
        if (!form.nombre) newErrors.nombre = "El nombre es obligatorio";
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.nombre)) newErrors.nombre = "El nombre solo puede contener letras y espacios";

        // Validación de Correo
        if (!form.correo) newErrors.correo = "El correo es obligatorio";
        else if (!/\S+@\S+\.\S+/.test(form.correo)) newErrors.correo = "El formato del correo no es válido";

        // Validación de Teléfono
        if (!form.telefono) newErrors.telefono = "El teléfono es obligatorio";
        else if (form.telefono.length < 9 || form.telefono.length > 12) newErrors.telefono = "El teléfono debe tener entre 9 y 12 dígitos";
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // 1. Validar el formulario antes de enviarlo
        const formErrors = validate();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return; // Detiene el envío si se encuentran errores
        }
        
        // 2. Limpiar errores si la validación pasa
        setErrors({});

        // 3. Intentar enviar los datos a la API
        try {
            const data = await agregarPersonaApi(form);
            if (data.error) throw new Error(data.error);

            alert(`Arrendatario ${data.nombre} agregado correctamente`);
            setForm({ nombre: "", correo: "", telefono: "", rut: "" }); // Limpiar formulario
        } catch (err) {
            alert("Error al agregar Arrendatario: " + err.message);
        }
    };

    return (
        <div className="contenedorAgregar">
            <h2>Agregar Arrendatario</h2>
            <form onSubmit={handleSubmit} className="agregar-form" noValidate>
                <div className="form-group">
                    <label htmlFor="rut_persona">Rut</label>
                    <input id="rut_persona" type="text" name="rut" value={form.rut} onChange={handleChange} />
                    {errors.rut && <p className="error-message">{errors.rut}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="nombre_persona">Nombre completo</label>
                    <input id="nombre_persona" type="text" name="nombre" value={form.nombre} onChange={handleChange} />
                    {errors.nombre && <p className="error-message">{errors.nombre}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="correo_persona">Correo</label>
                    <input id="correo_persona" type="email" name="correo" value={form.correo} onChange={handleChange} />
                    {errors.correo && <p className="error-message">{errors.correo}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="telefono_persona">Teléfono</label>
                    <input id="telefono_persona" type="number" name="telefono" value={form.telefono} onChange={handleChange} />
                    {errors.telefono && <p className="error-message">{errors.telefono}</p>}
                </div>
                <div className="form-group span-full">
                    <button type="submit">Agregar Arrendatario</button>
                </div>
            </form>
        </div>
    );
}
export default AgregarPersona;