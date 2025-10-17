import React from "react";

function Tabla({ columnas, filas }) {
  return (
    <table>
      <thead>
        <tr>
          {columnas.map((col, i) => <th key={i}>{col}</th>)}
        </tr>
      </thead>
      <tbody>
        {filas.length > 0 ? (
          filas.map((fila, i) => (
            <tr key={i}>
              {Object.values(fila).map((val, j) => <td key={j}>{val}</td>)}
            </tr>
          ))
        ) : (
          <tr><td colSpan={columnas.length}>No hay datos</td></tr>
        )}
      </tbody>
    </table>
  );
}

export default Tabla;
