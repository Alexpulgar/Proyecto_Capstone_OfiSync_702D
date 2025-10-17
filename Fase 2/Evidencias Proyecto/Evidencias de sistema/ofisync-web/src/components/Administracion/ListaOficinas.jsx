import React from "react";
import "./Administracion.css";
import { Link } from "react-router-dom";

function ListaOficinas({ oficinas }) {
  return (
    <div className="lista-container">
      <div className="tabla-oficinas">
        <h2>Oficinas Registradas</h2>
        <p className="tabla-info">Total de oficinas en el sistema: {oficinas.length}</p>
        <table>
          <thead>
            <tr>
              <th>Edificio</th>
              <th>Piso</th>
              <th>Oficina</th>
              <th>Arrendatario</th>
              <th>Metros²</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {oficinas.length > 0 ? (
              oficinas.map((oficina, i) => (
                <tr key={i}>
                  <td>{oficina.edificio}</td>
                  <td>{oficina.numero_piso}</td>
                  <td>{oficina.oficina}</td>
                  <td>{oficina.arrendatario || "N/A"}</td>
                  <td>{oficina.area}</td>
                  <td>{oficina.estado}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6">No hay oficinas registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="acciones-laterales">
        <Link to="/Agregar" className="accion-btn">Agregar</Link>
        <a href="#" className="accion-btn">Actualizar</a>
        <a href="#" className="accion-btn">Eliminar</a>
      </div>
    </div>
  );
}

export default ListaOficinas;
