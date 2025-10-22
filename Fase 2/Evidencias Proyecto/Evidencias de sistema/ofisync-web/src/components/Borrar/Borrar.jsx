import BorrarPersona from "./BorrarPersona";
import BorrarOficina from "./BorrarOficina";
import BorrarPiso from "./BorrarPiso";


function Borrar() {
  return (
    <div className="contenedorPrincipal">
      <div className="seccion">
        <BorrarPersona />
       
        
      </div>
      <div className="seccion">
        <BorrarOficina />
        
        
      </div>
      <div className="seccion">
        <BorrarPiso />
        
        
      </div>
      <div className="seccion">
        
      </div>
    </div>
  );
}

export default Borrar;
