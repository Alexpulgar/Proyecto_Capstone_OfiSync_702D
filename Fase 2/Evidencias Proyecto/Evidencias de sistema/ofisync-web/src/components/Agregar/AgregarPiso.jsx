import React, { useState, useEffect } from "react";
import { agregarPisosApi, getPisosPorEdificio } from "../../../services/pisoService";
import { getEdificios } from "../../../services/edificioService";
import "./agregar.css";

function AgregarPiso() {
  const [form, setForm] = useState({ edificio_id: "", cantidad: "" });
  const [edificios, setEdificios] = useState([]);
  const [pisosExistentes, setPisosExistentes] = useState(0);
  const [pisosDisponibles, setPisosDisponibles] = useState(0);

  useEffect(() => {
    getEdificios()
      .then((data) => setEdificios(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (form.edificio_id) {
      const edificioSeleccionado = edificios.find(
        (e) => e.id === parseInt(form.edificio_id)
      );
      if (!edificioSeleccionado) return;

      getPisosPorEdificio(form.edificio_id).then((pisos) => {
        setPisosExistentes(pisos.length);
        setPisosDisponibles(edificioSeleccionado.pisos_totales - pisos.length);
      });
    } else {
      setPisosExistentes(0);
      setPisosDisponibles(0);
    }
  }, [form.edificio_id, edificios]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.edificio_id || !form.cantidad) {
      alert("Debe seleccionar un edificio y especificar una cantidad.");
      return;
    }
    if (isNaN(form.cantidad) || parseInt(form.cantidad) <= 0) {
      alert("La cantidad debe ser un número positivo.");
      return;
    }
    if (parseInt(form.cantidad) > pisosDisponibles) {
      alert(`Solo puedes agregar hasta ${pisosDisponibles} pisos.`);
      return;
    }

    try {
      const data = await agregarPisosApi({
        edificio_id: parseInt(form.edificio_id),
        cantidad: parseInt(form.cantidad),
      });
      if (data.error) throw new Error(data.error);
      alert(data.mensaje || "Pisos agregados correctamente.");
      setForm({ edificio_id: "", cantidad: "" });
      setPisosExistentes(0);
      setPisosDisponibles(0);
    } catch (err) {
      alert("Error al agregar pisos: " + err.message);
    }
  };

  return (
    <div className="contenedorAgregar">
            <h2>Agregar Pisos a un Edificio</h2>
            <form onSubmit={handleSubmit} className="agregar-form">
                <div className="form-group">
                    <label htmlFor="edificio_id_piso">Edificio</label>
                    <select id="edificio_id_piso" name="edificio_id" value={form.edificio_id} onChange={handleChange} required>
                        <option value="">Seleccione un edificio</option>
                        {edificios.map((edificio) => (
                            <option key={edificio.id} value={edificio.id}>
                                {edificio.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="cantidad_pisos">Cantidad de pisos a agregar</label>
                    <input id="cantidad_pisos" type="number" name="cantidad" value={form.cantidad} onChange={handleChange} required min="1" max={pisosDisponibles} />
                </div>
                {form.edificio_id && (
                    <div className="pisos-info">
                        Pisos creados: {pisosExistentes} | Pisos restantes: {pisosDisponibles}
                    </div>
                )}
                <div className="form-group span-full">
                    <button type="submit">Agregar Pisos</button>
                </div>
            </form>
        </div>
  );
}

export default AgregarPiso;