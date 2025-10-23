import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEdificios, eliminarEdificioApi, getEdificioByIdApi } from "../../../services/edificioService";

function BorrarEdificio() {
    const navigate = useNavigate();

    // Estados
    const [listaEdificios, setListaEdificios] = useState([]);
    const [selectedEdificioId, setSelectedEdificioId] = useState("");
    const [edificioEncontrado, setEdificioEncontrado] = useState(null); // Objeto con detalles
    
    const [cargando, setCargando] = useState(false);
    const [cargandoEliminar, setCargandoEliminar] = useState(false);

    // 1. Cargar la lista de edificios al inicio
    useEffect(() => {
        const cargarLista = async () => {
            try {
                const data = await getEdificios();
                if (data.error) throw new Error(data.error);
                setListaEdificios(data);
            } catch (error) {
                alert("Error al cargar la lista de edificios: " + error.message);
            }
        };
        cargarLista();
    }, []);

    // 2. Cargar los detalles del edificio cuando se selecciona uno
    useEffect(() => {
        setEdificioEncontrado(null); // Limpia datos anteriores

        if (selectedEdificioId) {
            const cargarDatos = async () => {
                try {
                    setCargando(true);
                    const data = await getEdificioByIdApi(selectedEdificioId);
                    if (data.error) throw new Error(data.error);
                    setEdificioEncontrado(data);
                } catch (error) {
                    alert("Error al cargar datos del edificio: " + error.message);
                } finally {
                    setCargando(false);
                }
            };
            cargarDatos();
        }
    }, [selectedEdificioId]);


    // 3. Función para el botón de ELIMINAR
    const handleEliminar = async () => {
        if (!edificioEncontrado) {
            alert("No hay edificio seleccionado para eliminar.");
            return;
        }

        const isConfirmed = window.confirm(
          `¿Está SEGURO que desea eliminar el Edificio "${edificioEncontrado.nombre}" (ID: ${edificioEncontrado.id})?\n\nEsta acción no se puede deshacer.`
        );

        if (isConfirmed) {
            try {
                setCargandoEliminar(true);
                // Usamos el ID del edificio encontrado
                const data = await eliminarEdificioApi(edificioEncontrado.id);
                
                alert(data.message); // "Edificio eliminado correctamente"
                
                // Limpiamos todo y redirigimos
                setEdificioEncontrado(null);
                setSelectedEdificioId("");
                navigate('/administracion');

            } catch (err) {
                // Captura el error (ej: "No se puede eliminar porque tiene pisos")
                alert("Error al eliminar Edificio: " + err.message);
            } finally {
                setCargandoEliminar(false);
            }
        }
    };

    return (
        // Usamos las clases de tu 'actualizar.css'
        <div className="contenedorAgregar">
            <h2>Eliminar Edificio</h2>
            <p>Seleccione el edificio que desea eliminar.</p>
            
            {/* Formulario de Búsqueda (Selector) */}
            <div className="agregar-form">
                <div className="form-group span-full">
                    <label>1. Seleccione el Edificio</label>
                    <select 
                        value={selectedEdificioId}
                        onChange={(e) => setSelectedEdificioId(e.target.value)} 
                        disabled={cargando || cargandoEliminar}
                    >
                        <option value="">-- Seleccione un Edificio --</option>
                        {listaEdificios.map(ed => (
                            <option key={ed.id} value={ed.id}>
                                {ed.nombre} (Pisos: {ed.pisos_totales})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- Resultados de la Búsqueda --- */}
            {cargando && <p>Cargando datos del edificio...</p>}

            {edificioEncontrado && (
                <div className="agregar-form" style={{ marginTop: '20px' }}>
                    
                    <div style={{ gridColumn: '1 / -1' }}>
                      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '10px 0' }} />
                      <h4 style={{ color: '#184866', margin: '0 0 15px 0' }}>Datos del Edificio a Eliminar</h4>
                    </div>

                    <div className="form-group span-2">
                        <label>Nombre</label>
                        <input type="text" value={edificioEncontrado.nombre} disabled />
                    </div>
                    <div className="form-group">
                        <label>Pisos Totales</label>
                        <input type="text" value={edificioEncontrado.pisos_totales} disabled />
                    </div>
                    <div className="form-group">
                        <label>Área Bruta por Piso (m²)</label>
                        <input type="text" value={edificioEncontrado.area_bruta_por_piso} disabled />
                    </div>
                    <div className="form-group span-2">
                        <label>Área Común (%)</label>
                        <input type="text" value={edificioEncontrado.area_comun_pct} disabled />
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
                          {cargandoEliminar ? 'Eliminando...' : 'Eliminar Edificio'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BorrarEdificio;