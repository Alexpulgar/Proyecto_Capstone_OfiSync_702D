import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getEdificios } from "../../../services/edificioService";
import { eliminarPisosApi } from "../../../services/pisoService";

function BorrarPiso() {
  const navigate = useNavigate();

  // Estados
  const [listaEdificios, setListaEdificios] = useState([]);

  // Almacena el objeto COMPLETO del edificio seleccionado
  const [selectedEdificio, setSelectedEdificio] = useState(null);
  const [cantidadABorrar, setCantidadABorrar] = useState("");

  const [cargando, setCargando] = useState(false);

  // 1. Cargar la lista de edificios al inicio
  useEffect(() => {
    const cargarEdificios = async () => {
      try {
        const data = await getEdificios();
        if (data.error) throw new Error(data.error);
        setListaEdificios(data);
      } catch (error) {
        alert("Error al cargar edificios: " + error.message);
      }
    };
    cargarEdificios();
  }, []);

  // 2. Manejador del <select> de edificio
  const handleEdificioChange = (e) => {
    const edificioId = e.target.value;
    // Busca el objeto completo del edificio en la lista
    const edificio = listaEdificios.find(
      (ed) => ed.id === parseInt(edificioId)
    );

    setSelectedEdificio(edificio || null);
    setCantidadABorrar(""); // Resetea la cantidad
  };

  // 3. Manejador del input de cantidad
  const handleCantidadChange = (e) => {
    const valor = e.target.value;
    // Solo permite números
    if (valor === "" || /^[0-9\b]+$/.test(valor)) {
      setCantidadABorrar(valor);
    }
  };

  // 4. Manejador del Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!selectedEdificio) {
      alert("Por favor, seleccione un edificio.");
      return;
    }

    const cantidad = parseInt(cantidadABorrar, 10);

    if (isNaN(cantidad) || cantidad <= 0) {
      alert("Por favor, ingrese una cantidad de pisos válida.");
      return;
    }

    if (cantidad > selectedEdificio.pisos_totales) {
      alert(
        `No puede borrar ${cantidad} pisos. El edificio "${selectedEdificio.nombre}" solo tiene ${selectedEdificio.pisos_totales} pisos en total.`
      );
      return;
    }

    const isConfirmed = window.confirm(
      `¿Está SEGURO que desea eliminar los últimos ${cantidad} pisos del edificio "${
        selectedEdificio.nombre
      }"?\n\nLos pisos ${selectedEdificio.pisos_totales} al ${
        selectedEdificio.pisos_totales - cantidad + 1
      } serán borrados.\n\nEsta acción no se puede deshacer.`
    );

    if (isConfirmed) {
      try {
        setCargando(true);
        const datos = {
          edificio_id: selectedEdificio.id,
          cantidad_a_borrar: cantidad,
        };

        const data = await eliminarPisosApi(datos);

        alert(data.message);

        // Limpiamos todo y redirigimos
        setSelectedEdificio(null);
        setCantidadABorrar("");
        navigate("/administracion");
      } catch (err) {
        // Captura el error (ej: "No se puede eliminar porque tienen oficinas")
        alert("Error al eliminar Pisos: " + err.message);
      } finally {
        setCargando(false);
      }
    }
  };

  return (
    <div className="contenedorAgregar">
      <h2>Eliminar Pisos del Edificio</h2>
      <p>
        Seleccione un edificio e ingrese la cantidad de pisos a eliminar (se
        borrarán los pisos superiores).
      </p>

      <form onSubmit={handleSubmit} className="agregar-form">
        {/* 1. Selector de Edificio */}
        <div className="form-group span-full">
          <label>1. Seleccione el Edificio</label>
          <select
            onChange={handleEdificioChange}
            value={selectedEdificio ? selectedEdificio.id : ""}
            disabled={cargando}
          >
            <option value="">-- Seleccione un Edificio --</option>
            {listaEdificios.map((ed) => (
              <option key={ed.id} value={ed.id}>
                {ed.nombre} (Pisos: {ed.pisos_totales})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Sección que aparece al seleccionar un edificio */}
        {selectedEdificio && (
          <>
            {/* Campo de texto informativo (deshabilitado) */}
            <div className="form-group">
              <label>Pisos Totales Actuales</label>
              <input
                type="text"
                value={selectedEdificio.pisos_totales}
                disabled
              />
            </div>

            {/* Campo para ingresar la cantidad a borrar */}
            <div className="form-group">
              <label htmlFor="cantidad_borrar">
                2. Cantidad de pisos a borrar
              </label>
              <input
                id="cantidad_borrar"
                type="number"
                value={cantidadABorrar}
                onChange={handleCantidadChange}
                placeholder="Ej: 2"
                max={selectedEdificio.pisos_totales}
                min="1"
                disabled={cargando}
                required
              />
            </div>

            {/* Botón de Eliminar */}
            <div className="form-group span-full">
              <button
                type="submit"
                disabled={cargando || !cantidadABorrar} // Deshabilitado si está cargando o no hay cantidad
                style={{
                  background: "linear-gradient(45deg, #e53e3e, #f56565)", // Estilo rojo
                }}
              >
                {cargando ? "Eliminando..." : "Borrar Pisos Seleccionados"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default BorrarPiso;
