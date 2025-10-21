import ActualizarEdificio from "./ActualizarEdificio"
import ActualizarPersona from "./ActualizarPersona";
import "./actualizar.css";


function Actualizar() {
  return (
    <div className="contenedorPrincipal">
      <div className="seccion">
        <ActualizarEdificio />
        
      </div>

      <div className="seccion">
        <ActualizarPersona/>
        
      </div>
      
      <div className="seccion">
        
      </div>

      <div className="seccion">
        
      </div>

      
    </div>
  );
}

export default Actualizar;
