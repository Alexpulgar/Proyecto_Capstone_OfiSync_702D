import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Servicios de Oficina
import {
  getOficinasByPiso,
  getOficinaById,
  eliminarOficinaApi
} from "../../../services/oficinasService";

// Servicios necesarios para los dropdowns
import { getEdificios } from '../../../services/edificioService';
import { getPisosPorEdificio as getPisosByEdificio } from '../../../services/pisoService';

function BorrarOficina() {
    const navigate = useNavigate();

    // Estados para las listas
    const [edificios, setEdificios] = useState([]);
    const [pisos, setPisos] = useState([]);
    const [oficinas, setOficinas] = useState([]);

    // Estados de selección
    const [selectedEdificio, setSelectedEdificio] = useState('');
    const [selectedPiso, setSelectedPiso] = useState('');
    const [selectedOficina, setSelectedOficina] = useState(''); // ID de la oficina

    // Estado para los datos
    const [oficinaEncontrada, setOficinaEncontrada] = useState(null); // Objeto de la oficina

    // Estados de UI
    const [cargando, setCargando] = useState(false);
    const [cargandoEliminar, setCargandoEliminar] = useState(false);

    // 1. Cargar Edificios al inicio
    useEffect(() => {
        const cargarEdificios = async () => {
            try {
                const data = await getEdificios();
                if (data.error) throw new Error(data.error);
                setEdificios(data);
            } catch (error) {
                alert("Error al cargar edificios: " + error.message);
            }
        };
        cargarEdificios();
    }, []);

    // 2. Cargar Pisos cuando cambia el Edificio
    useEffect(() => {
        // Resetea
        setSelectedPiso('');
        setSelectedOficina('');
        setOficinas([]);
        setOficinaEncontrada(null);

        if (selectedEdificio) {
            const cargarPisos = async () => {
                try {
                    setCargando(true);
                    const dataPisos = await getPisosByEdificio(selectedEdificio);
                    if (dataPisos.error) throw new Error(dataPisos.error);
                    setPisos(dataPisos);
                } catch (error) {
                    alert("Error al cargar pisos: " + error.message);
                } finally {
                    setCargando(false);
                }
            };
            cargarPisos();
        }
    }, [selectedEdificio]);

    // 3. Cargar Oficinas cuando cambia el Piso
    useEffect(() => {
        // Resetea
        setSelectedOficina('');
        setOficinas([]);
        setOficinaEncontrada(null);

        if (selectedPiso) {
            const cargarOficinas = async () => {
                try {
                    setCargando(true);
                    const dataOficinas = await getOficinasByPiso(selectedPiso);
                    if (dataOficinas.error) throw new Error(dataOficinas.error);
                    setOficinas(dataOficinas);
                } catch (error) {
                    alert("Error al cargar oficinas: " + error.message);
                } finally {
                    setCargando(false);
                }
            };
            cargarOficinas();
        }
    }, [selectedPiso]);
    
    // 4. Cargar DATOS de la Oficina cuando se selecciona
    useEffect(() => {
        setOficinaEncontrada(null); // Limpia datos anteriores

        if (selectedOficina) {
            const cargarDatosOficina = async () => {
                try {
                    setCargando(true);
                    const detalles = await getOficinaById(selectedOficina);
                    if (detalles.error) throw new Error(detalles.error);
                    setOficinaEncontrada(detalles); // Guarda el objeto completo
                } catch (error) {
                    alert("Error al cargar detalles de la oficina: " + error.message);
                } finally {
                    setCargando(false);
                }
            };
            cargarDatosOficina();
        }
    }, [selectedOficina]);


    // 5. Función para el botón de ELIMINAR
    const handleEliminar = async () => {
        if (!oficinaEncontrada) {
            alert("No hay oficina seleccionada para eliminar.");
            return;
        }

        const isConfirmed = window.confirm(
          `¿Está SEGURO que desea eliminar la Oficina con código "${oficinaEncontrada.codigo}" (ID: ${oficinaEncontrada.id})?\n\nEsta acción no se puede deshacer.`
        );

        if (isConfirmed) {
            try {
                setCargandoEliminar(true);
                // Usamos el ID de la oficina encontrada
                const data = await eliminarOficinaApi(oficinaEncontrada.id);
                
                alert(data.message); // "Oficina eliminada correctamente"
                
                // Limpiamos todo y redirigimos
                setOficinaEncontrada(null);
                setSelectedEdificio('');
                navigate('/administracion');

            } catch (err) {
                // Captura el error (ej: "No se puede eliminar...")
                alert("Error al eliminar Oficina: " + err.message);
            } finally {
                setCargandoEliminar(false);
            }
        }
    };

    return (
        // Usamos las clases de tu 'actualizar.css'
        <div className="contenedorAgregar">
            <h2>Eliminar Oficina</h2>
            <p>Seleccione la oficina que desea eliminar.</p>
            
            {/* Formulario de Búsqueda (3 Pasos) */}
            <div className="agregar-form">
                <div className="form-group span-full">
                    <label>1. Edificio:</label>
                    <select value={selectedEdificio} onChange={(e) => setSelectedEdificio(e.target.value)} disabled={cargando || cargandoEliminar}>
                        <option value="">-- Seleccione un Edificio --</option>
                        {edificios.map(ed => (
                            <option key={ed.id} value={ed.id}>{ed.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group span-full">
                    <label>2. Piso:</label>
                    <select value={selectedPiso} onChange={(e) => setSelectedPiso(e.target.value)} disabled={!selectedEdificio || cargando || cargandoEliminar}>
                        <option value="">-- Seleccione un Piso --</option>
                        {pisos.map(piso => (
                            <option key={piso.id} value={piso.id}>{piso.numero_piso}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group span-full">
                    <label>3. Oficina (Código):</label>
                    <select value={selectedOficina} onChange={(e) => setSelectedOficina(e.target.value)} disabled={!selectedPiso || cargando || cargandoEliminar}>
                        <option value="">-- Seleccione una Oficina --</option>
                        {oficinas.map(of => (
                            <option key={of.id} value={of.id}>{of.codigo}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- Resultados de la Búsqueda --- */}
            {oficinaEncontrada && (
                <div className="agregar-form" style={{ marginTop: '20px' }}>
                    
                    <div style={{ gridColumn: '1 / -1' }}>
                      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '10px 0' }} />
                      <h4 style={{ color: '#184866', margin: '0 0 15px 0' }}>Datos de la Oficina a Eliminar</h4>
                    </div>

                    <div className="form-group">
                        <label>Código Oficina</label>
                        <input type="text" value={oficinaEncontrada.codigo} disabled />
                    </div>
                    <div className="form-group">
                        <label>Área (m²)</label>
                        <input type="text" value={oficinaEncontrada.area} disabled />
                    </div>
                    <div className="form-group">
                        <label>Estado</label>
                        <input type="text" value={oficinaEncontrada.estado} disabled />
                    </div>
                    <div className="form-group">
                        <label>Arrendatario (ID)</label>
                        <input type="text" value={oficinaEncontrada.persona_id || 'Ninguno'} disabled />
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
                          {cargandoEliminar ? 'Eliminando...' : 'Eliminar Oficina'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BorrarOficina;