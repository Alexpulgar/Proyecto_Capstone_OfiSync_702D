import React from "react";
import AgregarPersona from "./AgregarPersona";
import AgregarOficina from "./AgregarOficina";
import AgregarEdificio from "./AgregarEdificio";
import AgregarPiso from "./AgregarPiso";
import "./agregar.css";

function Agregar() {
  return (
    <div className="contenedorPrincipal">
      <div className="seccion">
        <AgregarEdificio />
      </div>

      <div className="seccion">
        <AgregarPiso />
      </div>
      
      <div className="seccion">
        <AgregarPersona />
      </div>

      <div className="seccion">
        <AgregarOficina />
      </div>

      
    </div>
  );
}

export default Agregar;
