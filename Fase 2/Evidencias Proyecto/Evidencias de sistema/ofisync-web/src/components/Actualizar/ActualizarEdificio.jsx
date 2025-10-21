import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Ya no usamos useParams
import { 
    actualizarEdificioApi, 
    getEdificioByIdApi, 
    getEdificios // Importamos la lista total
} from "../../../services/edificioService";

function ActualizarEdificio() {
    const navigate = useNavigate();

    // 1. NUEVOS ESTADOS
    // Estado para guardar la lista de todos los edificios (para el <select>)
    const [listaEdificios, setListaEdificios] = useState([]);
    // Estado para guardar el ID del edificio que el usuario seleccione
    const [edificioSeleccionadoId, setEdificioSeleccionadoId] = useState("");

    // Estado para el formulario (igual que antes)
    const [form, setForm] = useState({
        nombre: "",
        pisos_totales: "",
        area_bruta_por_piso: "",
        area_comun_pct: ""
    });

    // 2. PRIMER USEEFFECT: Carga la lista de edificios para el desplegable
    useEffect(() => {
        const cargarLista = async () => {
            try {
                const data = await getEdificios();
                if (data.error) throw new Error(data.error);
                setListaEdificios(data); // Guardamos la lista
            } catch (err) {
                alert("Error al cargar la lista de edificios: " + err.message);
            }
        };
        cargarLista();
    }, []); // Se ejecuta solo una vez al cargar

    // 3. SEGUNDO USEEFFECT: Se ejecuta CADA VEZ que el usuario cambia el <select>
    useEffect(() => {
        const cargarDatosDelEdificio = async () => {
            if (!edificioSeleccionadoId) {
                // Si el usuario selecciona "Seleccionar...", reseteamos el form
                setForm({ nombre: "", pisos_totales: "", area_bruta_por_piso: "", area_comun_pct: "" });
                return;
            }

            try {
                // Buscamos los datos del ID seleccionado
                const data = await getEdificioByIdApi(edificioSeleccionadoId);
                if (data.error) throw new Error(data.error);
                
                // Rellenamos el formulario con esos datos
                setForm({
                    nombre: data.nombre,
                    pisos_totales: data.pisos_totales,
                    area_bruta_por_piso: data.area_bruta_por_piso,
                    area_comun_pct: data.area_comun_pct
                });

            } catch (err) {
                alert("Error al cargar datos del edificio: " + err.message);
            }
        };

        cargarDatosDelEdificio();
    }, [edificioSeleccionadoId]); // Se "dispara" cuando esta variable cambia

    // El handleChange es idéntico
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // El handleSubmit es casi idéntico, solo usa 'edificioSeleccionadoId'
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validamos que haya un edificio seleccionado
        if (!edificioSeleccionadoId) {
            alert("Por favor, selecciona un edificio para actualizar");
            return;
        }

        // Tus validaciones (las copié de AgregarEdificio)
        if (!form.nombre || !form.pisos_totales || !form.area_bruta_por_piso || !form.area_comun_pct) {
            alert("Faltan campos obligatorios"); return;
        }
        if (form.pisos_totales !== null && form.pisos_totales <= 0) {
            alert("La cantidad de pisos debe ser positiva"); return;
        }
        if (form.area_bruta_por_piso !== null && form.area_bruta_por_piso <= 0) {
            alert("El área bruta por piso debe ser positiva"); return;
        }
        if (form.area_comun_pct !== null && (form.area_comun_pct < 0 || form.area_comun_pct > 100)) {
            alert("El porcentaje de área común debe estar entre 0 y 100"); return;
        }

        try {
            // Usamos el ID del estado 'edificioSeleccionadoId'
            const data = await actualizarEdificioApi(edificioSeleccionadoId, form); 
            if (data.error) throw new Error(data.error);

            alert(`${data.nombre} actualizado correctamente`);
            navigate('/administracion'); // Redirigimos

        } catch (err) {
            alert("Error al actualizar Edificio: " + err.message);
        }
    };

    // 4. JSX MODIFICADO
    return (
        <div className="contenedorAgregar">
            <h2>Actualizar Edificio</h2>
            
            {/* --- ESTE ES EL NUEVO DESPLEGABLE --- */}
            <div className="form-group span-full" style={{ marginBottom: '20px' }}>
                <label htmlFor="edificioSelect">Selecciona un Edificio</label>
                <select 
                    id="edificioSelect"
                    value={edificioSeleccionadoId}
                    onChange={(e) => setEdificioSeleccionadoId(e.target.value)}
                >
                    <option value="">-- Seleccionar un edificio --</option>
                    {listaEdificios.map((edificio) => (
                        <option key={edificio.id} value={edificio.id}>
                            {edificio.nombre} (ID: {edificio.id})
                        </option>
                    ))}
                </select>
            </div>
            
            {/* --- FIN DEL DESPLEGABLE --- */}


            {/* Mostramos el formulario solo si hay un edificio seleccionado */}
            {edificioSeleccionadoId && (
                <form onSubmit={handleSubmit} className="agregar-form">
                    <div className="form-group span-2">
                        <label htmlFor="nombre_edificio">Nombre Edificio</label>
                        <input id="nombre_edificio" type="text" name="nombre" value={form.nombre} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="pisos_totales">Pisos Totales</label>
                        <input id="pisos_totales" type="number" name="pisos_totales" value={form.pisos_totales} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="area_bruta_por_piso">Área bruta por piso (m²)</label>
                        <input id="area_bruta_por_piso" type="number" name="area_bruta_por_piso" value={form.area_bruta_por_piso} onChange={handleChange} />
                    </div>
                    <div className="form-group span-2">
                        <label htmlFor="area_comun_pct">Área común (%)</label>
                        <input id="area_comun_pct" type="number" name="area_comun_pct" value={form.area_comun_pct} onChange={handleChange} />
                    </div>
                    <div className="form-group span-full">
                        <button type="submit">Guardar Cambios</button>
                    </div>
                </form>
            )}

        </div>
    );
}

export default ActualizarEdificio;