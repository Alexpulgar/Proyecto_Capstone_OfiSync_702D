import React, { useState, useEffect } from "react";
import { getEntradas, createEntrada } from "../../../services/bitacoraService";
import "./Bitacora.css"; 

// Función simple para formatear la fecha
const formatFecha = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function Bitacora() {
  const [entradas, setEntradas] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    tipo: "General",
  });

  useEffect(() => {
    cargarEntradas();
  }, []);

  const cargarEntradas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEntradas();
      setEntradas(data);
    } catch (err) {
      console.error("Error al cargar bitácora:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.titulo.trim() || !form.descripcion.trim()) {
      setError("El título y la descripción son obligatorios.");
      return;
    }

    try {
      await createEntrada(form);
      setForm({ titulo: "", descripcion: "", tipo: "General" });
      cargarEntradas(); 
    } catch (err) {
      console.error("Error al guardar entrada:", err);
      setError(err.message);
    }
  };

  return (
    <div className="bitacora-container">
      <h2>Bitácora del Edificio</h2>

      <form className="bitacora-form" onSubmit={handleSubmit}>
        <h3>Nueva Entrada</h3>
        {error && <p className="error-msg">{error}</p>}
        <div className="form-group">
          <label htmlFor="titulo">Título:</label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            placeholder="Ej: Falla ascensor 1"
            value={form.titulo}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="tipo">Tipo:</label>
          <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange}>
            <option value="General">General</option>
            <option value="Acceso">Control de Acceso</option>
            <option value="Incidente">Incidente</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Nota">Nota</option>
          </select>
        </div>
        <div className="form-group span-2">
          <label htmlFor="descripcion">Descripción:</label>
          <textarea
            id="descripcion"
            name="descripcion"
            placeholder="Describa el evento o la novedad..."
            value={form.descripcion}
            onChange={handleChange}
            rows={4}
          />
        </div>
        <div className="form-group span-2">
          <button type="submit">Agregar a Bitácora</button>
        </div>
      </form>

      <div className="bitacora-list-container">
        <h3>Registros Anteriores</h3>
        {loading && <p>Cargando...</p>}
        {!loading && entradas.length === 0 ? (
          <p>No hay entradas en la bitácora.</p>
        ) : (
          <div className="bitacora-list">
            {entradas.map((entry) => (
              <div key={entry.id} className="bitacora-entry">
                <div className="entry-header">
                  <h4>{entry.titulo}</h4>
                  <span className={`entry-tipo tipo-${entry.tipo.toLowerCase()}`}>{entry.tipo}</span>
                </div>
                <p className="entry-desc">{entry.descripcion}</p>
                <small className="entry-fecha">{formatFecha(entry.creado_en)}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bitacora;