import React, { useState, useEffect } from "react";
import { getPisos } from "../../../services/pisoService";
import { getPersonas } from "../../../services/personaService";
import { agregarOficinaApi } from "../../../services/oficinasService";
import { getEdificios } from "../../../services/edificioService";
import "./agregar.css";

function AgregarOficina() {
  const [form, setForm] = useState({
    codigo: "",
    piso_id: "",
    area: "",
    estado: "libre",
    persona_id: "",
    edificio_id: ""
  });

  const [pisos, setPisos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [edificios, setEdificios] = useState([]);

  useEffect(() => {
    getPisos()
      .then((data) => setPisos(Array.isArray(data) ? data : []))
      .catch(() => setPisos([]));

    getPersonas()
      .then((data) => setPersonas(Array.isArray(data) ? data : []))
      .catch(() => setPersonas([]));

    getEdificios()
      .then((data) => setEdificios(Array.isArray(data) ? data : []))
      .catch(() => setEdificios([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "edificio_id") {
      setForm({ ...form, edificio_id: value, piso_id: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.codigo || !form.piso_id || !form.area) {
      alert("Faltan campos obligatorios");
      return;
    }
    if (isNaN(form.area) || Number(form.area) <= 0) {
      alert("El área debe ser un número positivo");
      return;
    }

    try {
      const payload = {
        ...form,
        piso_id: parseInt(form.piso_id),
        area: parseFloat(form.area),
        persona_id: form.persona_id === "" ? null : parseInt(form.persona_id),
        edificio_id: parseInt(form.edificio_id)
      };

      const data = await agregarOficinaApi(payload);
      if (data.error) throw new Error(data.error);
      alert(`Oficina ${data.codigo} agregada correctamente`);
      setForm({
        codigo: "",
        piso_id: "",
        area: "",
        estado: "libre",
        persona_id: "",
        edificio_id: ""
      });
    } catch (err) {
      alert("Error al agregar oficina: " + err.message);
    }
  };

  const pisosFiltrados = pisos.filter((p) => p.edificio_id.toString() === form.edificio_id);

  return (
    <div className="contenedorAgregar">
      <h2>Agregar Oficina</h2>
      <form onSubmit={handleSubmit} className="agregar-form">
        <div className="form-group">
          <label htmlFor="edificio_id_oficina">Edificio</label>
          <select
            id="edificio_id_oficina"
            name="edificio_id"
            value={form.edificio_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un edificio</option>
            {(edificios || []).map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="piso_id_oficina">Piso</label>
          <select
            id="piso_id_oficina"
            name="piso_id"
            value={form.piso_id}
            onChange={handleChange}
            required
            disabled={!form.edificio_id}
          >
            <option value="">Seleccione un piso</option>
            {(pisosFiltrados || []).map((piso) => (
              <option key={piso.id} value={piso.id}>
                Piso {piso.numero_piso}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="codigo_oficina">Número Oficina</label>
          <input
            id="codigo_oficina"
            type="text"
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="area_oficina">Área (m²)</label>
          <input
            id="area_oficina"
            type="number"
            name="area"
            value={form.area}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="estado_oficina">Estado</label>
          <select id="estado_oficina" name="estado" value={form.estado} onChange={handleChange}>
            <option value="libre">Libre</option>
            <option value="ocupada">Ocupada</option>
            <option value="reservada">Reservada</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="persona_id_oficina">Arrendatario (opcional)</label>
          <select id="persona_id_oficina" name="persona_id" value={form.persona_id} onChange={handleChange}>
            <option value="">Sin arrendatario</option>
            {(personas || []).map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div className="form-group span-full">
          <button type="submit">Agregar Oficina</button>
        </div>
      </form>
    </div>
  );
}
export default AgregarOficina;