import React, { useEffect, useState } from "react";
import BusquedaOficina from "./BusquedaOficina";
import ListaOficinas from "./ListaOficinas";
import "./Administracion.css";
import { getOficinas, buscarOficinas } from "../../../services/oficinasService";

function Administracion() {
  const [oficinas, setOficinas] = useState([]);
  const [oficinasFiltradas, setOficinasFiltradas] = useState([]);
  const [filtro, setFiltro] = useState({
    codigo: "",
    piso: "",
    estado: "",
    arrendatario: "",
  });

  // 🔹 Cargar todas las oficinas al montar
  useEffect(() => {
    getOficinas()
      .then(setOficinas)
      .catch((err) => console.error("Error al cargar oficinas:", err));
  }, []);

  // 🔹 Manejo de cambios en los filtros
  const handleChange = (e) => setFiltro({ ...filtro, [e.target.name]: e.target.value });

  // 🔹 Limpiar filtros
  const handleClear = () => {
    setFiltro({ codigo: "", piso: "", estado: "", arrendatario: "" });
    setOficinasFiltradas([]);
  };

  // 🔹 Buscar oficinas usando service
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resultados = await buscarOficinas(filtro);
      setOficinasFiltradas(resultados);
    } catch (err) {
      console.error("Error al buscar oficinas:", err);
    }
  };

  return (
    <>
      <BusquedaOficina
        filtro={filtro}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleClear={handleClear}
        oficinasFiltradas={oficinasFiltradas}
      />
      <ListaOficinas oficinas={oficinas} />
    </>
  );
}

export default Administracion;
