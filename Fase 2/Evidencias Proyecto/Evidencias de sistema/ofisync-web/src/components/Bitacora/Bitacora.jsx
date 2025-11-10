import React, { useState, useEffect } from "react";
import { getEntradas, createEntrada, updateEntrada, deleteEntrada } from "../../../services/bitacoraService";
import { getUsuario } from "../../../services/usuarioService"; 
import "./Bitacora.css"; 

const formatFecha = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const formInicial = {
  titulo: "",
  descripcion: "",
  tipo: "General",
  es_privado: false,
};

function Bitacora() {
  const [entradas, setEntradas] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(formInicial);
  
  const [editingId, setEditingId] = useState(null); 
  const [userRole, setUserRole] = useState(null);  

  useEffect(() => {
    const usuario = getUsuario(); 
    if (usuario && usuario.rol) {
      setUserRole(usuario.rol);
    }
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
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.titulo.trim() || !form.descripcion.trim()) {
      setError("El título y la descripción son obligatorios.");
      return;
    }

    try {
      if (editingId) {
        await updateEntrada(editingId, form);
      } else {
        await createEntrada(form);
      }
      setForm(formInicial); 
      setEditingId(null); 
      cargarEntradas();     
    } catch (err) {
      console.error("Error al guardar entrada:", err);
      setError(err.message);
    }
  };

  const handleEdit = (entrada) => {
    setEditingId(entrada.id);
    setForm({
      titulo: entrada.titulo,
      descripcion: entrada.descripcion,
      tipo: entrada.tipo,
      es_privado: entrada.es_privado || false
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(formInicial);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta entrada?")) {
      try {
        setError(null);
        await deleteEntrada(id);
        cargarEntradas(); 
      } catch (err) {
        console.error("Error al borrar entrada:", err);
        setError(err.message);
      }
    }
  };

  const canManage = userRole === 'admin' || userRole === 'conserje';

  return (
    <div className="bitacora-container">
      <h2>Bitácora del Edificio</h2>

      <form className="bitacora-form" onSubmit={handleSubmit}>
        <h3>{editingId ? "Editando Entrada" : "Nueva Entrada"}</h3>
        {error && <p className="error-msg">{error}</p>}
        
        <div className="form-group">
          <label htmlFor="titulo">Título:</label>
          <input id="titulo" name="titulo" type="text" value={form.titulo} onChange={handleChange} placeholder="Ej: Falla ascensor 1" />
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
          <textarea id="descripcion" name="descripcion" value={form.descripcion} onChange={handleChange} rows={4} placeholder="Describa el evento o la novedad..."/>
        </div>

        <div className="form-group form-check">
          <input id="es_privado" name="es_privado" type="checkbox" checked={form.es_privado} onChange={handleChange} />
          <label htmlFor="es_privado">Marcar como nota privada (solo Admin/Conserje)</label>
        </div>

        <div className="form-group span-2 form-buttons">
          <button type="submit">{editingId ? "Actualizar Entrada" : "Agregar a Bitácora"}</button>

          {editingId && (
            <button type="button" className="btn-cancel" onClick={handleCancelEdit}>Cancelar Edición</button>
          )}
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
              <div key={entry.id} className={`bitacora-entry ${entry.es_privado ? 'privado' : ''}`}>
                <div className="entry-header">
                  <h4>{entry.titulo}</h4>
                  <span className={`entry-tipo tipo-${entry.tipo.toLowerCase()}`}>{entry.tipo}</span>
                </div>

                {entry.es_privado && <small className="entry-privado"> NOTA PRIVADA</small>}
                
                <p className="entry-desc">{entry.descripcion}</p>
                {/* (Esto ya lo tenías bien) */}
                <small className="entry-autor">Por: <strong>{entry.autor_nombre}</strong></small>
                <small className="entry-fecha">{formatFecha(entry.creado_en)}</small>

                {canManage && (
                  <div className="entry-actions">
                    <button className="btn-edit" onClick={() => handleEdit(entry)}>Editar</button>
                    <button className="btn-delete" onClick={() => handleDelete(entry.id)}>Borrar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bitacora;