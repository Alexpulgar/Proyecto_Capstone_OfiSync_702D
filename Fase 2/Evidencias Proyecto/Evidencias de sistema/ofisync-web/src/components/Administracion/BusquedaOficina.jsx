import React from "react";
import "./Administracion.css";

function BusquedaOficina({ filtro, handleChange, handleSubmit, handleClear, oficinasFiltradas }) {
  return (
    <div className="busqueda-container">
      <h2>Buscar Oficina</h2>
      <form onSubmit={handleSubmit} className="busqueda-form">
        <div className="form-group">
          <label htmlFor="codigo">Código Oficina</label>
          <input id="codigo" type="text" name="codigo" value={filtro.codigo} onChange={handleChange} placeholder="Ej: 101" />
        </div>

        <div className="form-group">
          <label htmlFor="piso">Piso</label>
          <input id="piso" type="number" name="piso" value={filtro.piso} onChange={handleChange} placeholder="Ej: 5" />
        </div>

        <div className="form-group">
          <label htmlFor="estado">Estado</label>
          <select id="estado" name="estado" value={filtro.estado} onChange={handleChange}>
            <option value="">Todos</option>
            <option value="libre">Libre</option>
            <option value="ocupada">Ocupada</option>
            <option value="reservada">Reservada</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="arrendatario">Arrendatario</label>
          <input id="arrendatario" type="text" name="arrendatario" value={filtro.arrendatario} onChange={handleChange} placeholder="Nombre" />
        </div>

        <div className="button-group">
            <button type="submit">Buscar</button>
            <button type="button" onClick={handleClear}>Limpiar</button>
        </div>
      </form>

      {/* La tabla de resultados se muestra aquí mismo */}
      <table>
        <thead>
          <tr>
            <th>Edificio</th>
            <th>Piso</th>
            <th>Código</th>
            <th>Arrendatario</th>
            <th>Metros²</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {oficinasFiltradas.length > 0 ? (
            oficinasFiltradas.map((oficina, index) => (
              <tr key={index}>
                <td>{oficina.edificio}</td>
                <td>{oficina.numero_piso}</td>
                <td>{oficina.oficina}</td>
                <td>{oficina.arrendatario || "N/A"}</td>
                <td>{oficina.area}</td>
                <td>{oficina.estado}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6">No se encontraron oficinas con los filtros aplicados.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default BusquedaOficina;
