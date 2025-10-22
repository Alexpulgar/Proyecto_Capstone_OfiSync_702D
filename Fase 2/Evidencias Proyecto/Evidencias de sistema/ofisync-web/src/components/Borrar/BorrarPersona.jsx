import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPersonaByRutApi, eliminarPersonaApi } from "../../../services/personaService";

// No necesitas importar 'actualizar.css' aquí, 
// porque el componente padre 'Actualizar.jsx' (donde lo vayas a poner) ya lo importa.

function BorrarPersona() {
    const navigate = useNavigate();
    const [rut, setRut] = useState(""); // Estado para el RUT que se está escribiendo
    const [personaEncontrada, setPersonaEncontrada] = useState(null); // Estado para guardar la persona
    const [cargando, setCargando] = useState(false);
    const [cargandoEliminar, setCargandoEliminar] = useState(false);

    // Función que se llama al presionar el botón de búsqueda
    const handleBuscar = async (e) => {
        e.preventDefault();
        
        if (!rut) {
            alert("Por favor, ingrese un RUT para buscar.");
            return;
        }

        setCargando(true);
        setPersonaEncontrada(null); // Limpiamos la búsqueda anterior

        try {
            // Llamamos a la API que ya tienes en tu personaService
            const data = await getPersonaByRutApi(rut);
            if (data.error) throw new Error(data.error);
            
            setPersonaEncontrada(data); // Guardamos la persona encontrada

        } catch (err) {
            // El 'err.message' vendrá del servicio (ej: "Persona no encontrada")
            alert("Error al buscar arrendatario: " + err.message);
        } finally {
            setCargando(false);
        }
    };

    // Función para el botón de ELIMINAR
    const handleEliminar = async () => {
        if (!personaEncontrada) {
            alert("No hay Arrendatario seleccionado para eliminar.");
            return;
        }

        const isConfirmed = window.confirm(
          `¿Está SEGURO que desea eliminar a ${personaEncontrada.nombre} (RUT: ${personaEncontrada.rut})?\n\nEsta acción no se puede deshacer.`
        );

        if (isConfirmed) {
            try {
                setCargandoEliminar(true);
                // Usamos el ID de la persona encontrada
                const data = await eliminarPersonaApi(personaEncontrada.id);
                
                alert(data.message); // "Persona eliminada correctamente"
                
                // Limpiamos todo y redirigimos
                setPersonaEncontrada(null);
                setRut("");
                navigate('/administracion');

            } catch (err) {
                // Captura el error (ej: "No se puede eliminar...")
                alert("Error al eliminar Arrendatario: " + err.message);
            } finally {
                setCargandoEliminar(false);
            }
        }
    };

    return (
        // Usamos las clases de tu 'actualizar.css'
        <div className="contenedorAgregar">
            <h2>Eliminar Arrendatario</h2>
            <p>Busque por RUT para eliminar un registro.</p>
            
            {/* Formulario de Búsqueda */}
            <form onSubmit={handleBuscar} className="agregar-form">
                <div className="form-group span-2">
                    <label htmlFor="rut_busqueda">RUT (Formato: 12345678-9)</label>
                    <input 
                        id="rut_busqueda"
                        type="text" 
                        value={rut}
                        onChange={(e) => setRut(e.target.value)}
                        placeholder="Ej: 12345678-9"
                        disabled={cargandoEliminar}
                    />
                </div>
                
                <div className="form-group" style={{ alignSelf: 'flex-end' }}>
                    <button type="submit" disabled={cargando || cargandoEliminar}>
                        {cargando ? 'Buscando...' : 'Buscar'}
                    </button>
                </div>
            </form>

            {/* --- Resultados de la Búsqueda --- */}
            {/* Solo se muestra si 'personaEncontrada' tiene datos */}
            {personaEncontrada && (
                <div className="agregar-form" style={{ marginTop: '20px' }}>
                    
                    <div style={{ gridColumn: '1 / -1' }}>
                      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '10px 0' }} />
                      <h4 style={{ color: '#184866', margin: '0 0 15px 0' }}>Datos de la Persona Encontrada</h4>
                    </div>

                    <div className="form-group">
                        <label>RUT</label>
                        <input type="text" value={personaEncontrada.rut} disabled />
                    </div>
                    <div className="form-group">
                        <label>Nombre</label>
                        <input type="text" value={personaEncontrada.nombre} disabled />
                    </div>
                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input type="text" value={personaEncontrada.correo} disabled />
                    </div>
                    <div className="form-group">
                        <label>Teléfono</label>
                        <input type="text" value={personaEncontrada.telefono} disabled />
                    </div>

                    {/* Botón de Eliminar */}
                    <div className="form-group span-full">
                         <button 
                          type="button" // MUY IMPORTANTE: type="button"
                          onClick={handleEliminar}
                          disabled={cargandoEliminar}
                          style={{ 
                            background: 'linear-gradient(45deg, #e53e3e, #f56565)', // Estilo rojo
                          }} 
                        >
                          {cargandoEliminar ? 'Eliminando...' : 'Eliminar Arendatario'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BorrarPersona;