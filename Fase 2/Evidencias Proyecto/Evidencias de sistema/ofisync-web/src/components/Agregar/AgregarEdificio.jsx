import React, { useState } from "react";
import { agregarEdificioApi } from "../../../services/edificioService";

function AgregarEdificio() {
    const [form, setForm] = useState({
        nombre: "",
        pisos_totales: "",
        area_bruta_por_piso: "",
        area_comun_pct: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.nombre || !form.pisos_totales || !form.area_bruta_por_piso || !form.area_comun_pct) {
            alert("Faltan campos obligatorios");
            return;
        }
        if (form.pisos_totales !== null && form.pisos_totales <= 0) {
            alert("La cantidad de pisos debe ser positiva");
            return;
        }
        if (form.area_bruta_por_piso !== null && form.area_bruta_por_piso <= 0) {
            alert("El área bruta por piso debe ser positiva");
            return;
        }
        if (form.area_comun_pct !== null && (form.area_comun_pct < 0 || form.area_comun_pct > 100)) {
            alert("El porcentaje de área común debe estar entre 0 y 100");
            return;
        }

        try {
            const data = await agregarEdificioApi(form);
            if (data.error) throw new Error(data.error);
            alert(`Edificio ${data.nombre} agregado correctamente`);
            setForm({ nombre: "", pisos_totales: "", area_bruta_por_piso: "", area_comun_pct: "" });
        } catch (err) {
            alert("Error al agregar Edificio: " + err.message);
        }
    };

    return (
        <div className="contenedorAgregar">
            <h2>Agregar Edificio</h2>
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
                    <button type="submit">Agregar Edificio</button>
                </div>
            </form>
        </div>
    );
}
export default AgregarEdificio;