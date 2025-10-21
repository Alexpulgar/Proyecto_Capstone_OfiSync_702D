import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPersonaByRutApi, actualizarPersonaApi } from "../../../services/personaService"; // Ajusta esta ruta


function ActualizarPersona() {
  const navigate = useNavigate();

  const [rutBusqueda, setRutBusqueda] = useState("");
  const [personaEncontrada, setPersonaEncontrada] = useState(null);
  
  const [form, setForm] = useState({
    correo: "",
    telefono: ""
  });
  
  const [mensaje, setMensaje] = useState("");

  const handleBuscar = async () => {
    const rutRegex = /^\d{7,8}-[\dKk]$/;
    if (!rutRegex.test(rutBusqueda)) {
        setMensaje("Error: Formato de RUT no válido. (Debe ser 12345678-9)");
        setPersonaEncontrada(null);
        return;
    }

    try {
      setMensaje("Buscando..."); // Mensaje de info
      setPersonaEncontrada(null); 
      const data = await getPersonaByRutApi(rutBusqueda);
      setPersonaEncontrada(data);
      setForm({
        correo: data.correo,
        telefono: data.telefono
      });
      setMensaje(""); 
    } catch (err) {
      setMensaje("Error: " + err.message);
      setPersonaEncontrada(null); 
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.correo || !form.telefono) {
        setMensaje("Error: El correo y el teléfono no pueden estar vacíos.");
        return;
    }

    try {
      setMensaje("Guardando...");
      const data = await actualizarPersonaApi(personaEncontrada.id, form);
      alert(`Persona ${data.nombre} actualizada correctamente.`);
      navigate('/administracion');
    } catch (err) {
      setMensaje("Error al guardar: " + err.message);
    }
  };

  return (
    // Usa 'contenedorAgregar' de tu CSS existente
    <div className="contenedorAgregar">
      <h2>Actualizar Arrendatario</h2>

      {/* --- SECCIÓN 1: BÚSQUEDA POR RUT --- */}
      <div className="agregar-form">
        <div className="form-group span-2">
          <label htmlFor="rut_busqueda">Buscar por RUT (Formato: 12345678-9)</label>
          <input
            id="rut_busqueda"
            type="text"
            value={rutBusqueda}
            onChange={(e) => setRutBusqueda(e.target.value)}
            placeholder="12345678-9"
          />
        </div>
        <div className="form-group">
          {/* --- 2. CLASE AÑADIDA --- */}
          <button type="button" onClick={handleBuscar} className="btn-full-height">Buscar</button>
        </div>
      </div>

      {mensaje && (
        /* --- 3. CLASES DINÁMICAS AÑADIDAS --- */
        <p className={`mensaje-feedback ${mensaje.startsWith('Error') ? 'error' : 'info'}`}>
          {mensaje}
        </p>
      )}

      {/* --- SECCIÓN 2: FORMULARIO DE ACTUALIZACIÓN --- */}
      {personaEncontrada && (
        /* --- 4. CLASES AÑADIDAS --- */
        <form onSubmit={handleSubmit} className="agregar-form form-seccion-actualizar">
          
          <div className="form-group span-full">
            {/* --- 5. CLASES AÑADIDAS --- */}
            <h3 className="form-subtitulo">Datos de la Persona</h3>
            <p className="form-subtitulo-desc">Solo se puede modificar el correo y el teléfono.</p>
          </div>

          {/* --- Campos Deshabilitados (Solo informativos) --- */}
          <div className="form-group">
            <label>RUT</label>
            <input type="text" value={personaEncontrada.rut} disabled />
          </div>

          <div className="form-group span-2">
            <label>Nombre Completo</label>
            <input type="text" value={personaEncontrada.nombre} disabled /> 
          </div>

          {/* --- Campos Editables --- */}
          <div className="form-group">
            <label htmlFor="correo">Correo Electrónico</label>
            <input
              id="correo"
              type="email"
              name="correo"
              value={form.correo} 
              onChange={handleChange}         
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              id="telefono"
              type="tel"
              name="telefono"
              value={form.telefono} 
              onChange={handleChange}     
              required
            />
          </div>
          
          <div className="form-group span-full">
            <button type="submit">Guardar Cambios</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ActualizarPersona;