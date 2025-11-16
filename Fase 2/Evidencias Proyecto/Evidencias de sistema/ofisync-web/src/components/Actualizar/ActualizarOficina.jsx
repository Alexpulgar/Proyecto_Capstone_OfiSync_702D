import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getEdificios } from "../../../services/edificioService";
import { getPisosPorEdificio as getPisosByEdificio } from "../../../services/pisoService";
import { getPersonas } from "../../../services/personaService";
import {
  getOficinasByPiso,
  getOficinaById,
  actualizarOficinaApi,
} from "../../../services/oficinasService";

const ActualizarOficina = () => {
  const navigate = useNavigate();

  const [edificios, setEdificios] = useState([]);
  const [pisos, setPisos] = useState([]);
  const [oficinas, setOficinas] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [selectedEdificio, setSelectedEdificio] = useState("");
  const [selectedPiso, setSelectedPiso] = useState("");
  const [selectedOficina, setSelectedOficina] = useState("");
  const [formData, setFormData] = useState({
    area: "",
    estado: "",
    persona_id: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const dataEdificios = await getEdificios();
        if (dataEdificios.error) throw new Error(dataEdificios.error);
        setEdificios(dataEdificios);

        const dataPersonas = await getPersonas();
        if (dataPersonas.error) throw new Error(dataPersonas.error);
        setPersonas(dataPersonas);
      } catch (error) {
        alert("Error al cargar datos iniciales: " + error.message);
      }
    };
    cargarDatosIniciales();
  }, []);

  const handleEdificioChange = async (e) => {
    const edificioId = e.target.value;
    setSelectedEdificio(edificioId);
    setSelectedPiso("");
    setSelectedOficina("");
    setPisos([]);
    setOficinas([]);
    setShowForm(false);
    if (edificioId) {
      try {
        setCargando(true);
        const dataPisos = await getPisosByEdificio(edificioId);
        if (dataPisos.error) throw new Error(dataPisos.error);
        setPisos(dataPisos);
      } catch (error) {
        alert("Error al cargar pisos: " + error.message);
      } finally {
        setCargando(false);
      }
    }
  };

  const handlePisoChange = async (e) => {
    const pisoId = e.target.value;
    setSelectedPiso(pisoId);
    setSelectedOficina("");
    setOficinas([]);
    setShowForm(false);
    if (pisoId) {
      try {
        setCargando(true);
        const dataOficinas = await getOficinasByPiso(pisoId);
        if (dataOficinas.error) throw new Error(dataOficinas.error);
        setOficinas(dataOficinas);
      } catch (error) {
        alert("Error al cargar oficinas: " + error.message);
      } finally {
        setCargando(false);
      }
    }
  };

  const handleOficinaChange = async (e) => {
    const oficinaId = e.target.value;
    setSelectedOficina(oficinaId);
    if (oficinaId) {
      try {
        setCargando(true);
        const detalles = await getOficinaById(oficinaId);
        if (detalles.error) throw new Error(detalles.error);
        setFormData({
          area: detalles.area || "",
          estado: detalles.estado || "libre",
          persona_id: detalles.persona_id || "",
        });
        setShowForm(true);
      } catch (error) {
        alert("Error al cargar detalles de la oficina: " + error.message);
        setShowForm(false);
      } finally {
        setCargando(false);
      }
    } else {
      setShowForm(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOficina) {
      alert("Por favor, seleccione una oficina para actualizar");
      return;
    }
    if (formData.estado.toLowerCase() === "ocupada" && !formData.persona_id) {
      alert('Debe asignar un arrendatario si la oficina está "Ocupada".');
      return;
    }
    if (isNaN(formData.area) || Number(formData.area) <= 0) {
      alert("El área(m²) debe ser un número positivo");
      return;
    }
    const isConfirmed = window.confirm(
      "¿Está seguro que desea actualizar la oficina?"
    );
    if (isConfirmed) {
      try {
        setCargando(true);
        const dataParaActualizar = {
          ...formData,
          area: parseFloat(formData.area),
          persona_id:
            formData.persona_id === "" ? null : parseInt(formData.persona_id),
        };
        const data = await actualizarOficinaApi(
          selectedOficina,
          dataParaActualizar
        );
        if (data.error) throw new Error(data.error);
        alert("Oficina actualizada correctamente");
        navigate("/administracion");
      } catch (error) {
        alert("Error al actualizar oficina: " + error.message);
      } finally {
        setCargando(false);
      }
    }
  };

  return (
    <div className="contenedorAgregar">
      <h2>Actualizar Oficina</h2>
      <p>Seleccione la oficina que desea modificar.</p>

      <div className="form-group span-full" style={{ marginBottom: "10px" }}>
        <label>1. Edificio:</label>
        <select
          value={selectedEdificio}
          onChange={handleEdificioChange}
          disabled={cargando}
        >
          <option value="">-- Seleccione un Edificio --</option>
          {edificios.map((ed) => (
            <option key={ed.id} value={ed.id}>
              {ed.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group span-full" style={{ marginBottom: "10px" }}>
        <label>2. Piso:</label>
        <select
          value={selectedPiso}
          onChange={handlePisoChange}
          disabled={!selectedEdificio || cargando}
        >
          <option value="">-- Seleccione un Piso --</option>
          {pisos.map((piso) => (
            <option key={piso.id} value={piso.id}>
              {piso.numero_piso}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group span-full" style={{ marginBottom: "20px" }}>
        <label>3. Oficina (Código):</label>
        <select
          value={selectedOficina}
          onChange={handleOficinaChange}
          disabled={!selectedPiso || cargando}
        >
          <option value="">-- Seleccione una Oficina --</option>
          {oficinas.map((of) => (
            <option key={of.id} value={of.id}>
              {of.codigo}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="agregar-form">
          <div style={{ gridColumn: "1 / -1" }}>
            <hr
              style={{
                border: "none",
                borderTop: "1px solid #eee",
                margin: "10px 0",
              }}
            />
            <h4 style={{ color: "#184866", margin: "0 0 15px 0" }}>
              Datos de la Oficina
            </h4>
          </div>

          <div className="form-group">
            <label htmlFor="area">Área (m²):</label>
            <input
              type="number"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleFormChange}
              required
              disabled={cargando}
            />
          </div>

          <div className="form-group">
            <label htmlFor="estado">Estado:</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleFormChange}
              required
              disabled={cargando}
            >
              <option value="libre">Libre</option>
              <option value="ocupada">Ocupada</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>

          <div className="form-group span-2">
            <label htmlFor="persona_id">Arrendatario (Persona):</label>
            <select
              id="persona_id"
              name="persona_id"
              value={formData.persona_id || ""}
              onChange={handleFormChange}
              disabled={cargando || formData.estado.toLowerCase() !== "ocupada"}
            >
              <option value="">-- Ninguno --</option>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}{" "}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group span-full">
            <button type="submit" disabled={cargando}>
              {cargando ? "Actualizando..." : "Actualizar Oficina"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ActualizarOficina;
