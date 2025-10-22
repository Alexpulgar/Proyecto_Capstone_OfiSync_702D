import React, {useState, useEffect} from "react";
import { getInsumos, createInsumo, updateInsumo, deleteInsumo } from "../../../services/insumoService";
import "./Insumos.css";

function InventarioInsumos(){
    const [insumos, setInsumos] = useState([]);
    const [editando, setEditando] = useState(false);
    const [form, setForm] = useState({
        id: null,
        nombre:"",
        categoria:"",
        stock:"", // Se mantiene como string para el input
        stock_minimo:"", // Se mantiene como string para el input
        estado:"activo",
    });

    useEffect(() => {
        cargarInsumos();
    }, []);

    const cargarInsumos = async () => {
        try {
            const data = await getInsumos();
            setInsumos(data);
        }catch (err) {
            console.error("Error al cargar insumos:", err);
            alert("No se pudieron cargar los insumos.");
        }
    };

    //Manejar cambios en el formulario
    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm((prev) => ({ ...prev, [name]: value}));
    };

    //guardar o actualizar
    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!form.nombre.trim()) return alert("El nombre es obligatorio");

        // Convertir a números para validar
        // Usamos parseInt para números enteros. Si necesitaras decimales, usa parseFloat.
        const stockNum = parseInt(form.stock, 10);
        const stockMinNum = parseInt(form.stock_minimo, 10);

        // Comprobar que no estén vacíos (form.stock === "") y que sean números (isNaN)
        if (form.stock === "" || isNaN(stockNum)) {
          return alert("El stock actual es obligatorio y debe ser un número.");
        }
        if (form.stock_minimo === "" || isNaN(stockMinNum)) {
          return alert("El stock mínimo es obligatorio y debe ser un número.");
        }

        // Comprobar que no sean negativos
        if (stockNum < 0) return alert("El stock actual no puede ser negativo");
        if (stockMinNum < 0) return alert("El stock mínimo no puede ser negativo");
        // --- FIN DE LA CORRECCIÓN 1 ---

        try {
            // Creamos un objeto de datos limpios para enviar al backend
            // Esto asegura que enviamos números, no los strings del formulario
            const payload = {...form, stock: stockNum, stock_minimo: stockMinNum
            };

            if(editando) {
                // Enviamos los datos parseados
                await updateInsumo(form.id, payload);
                alert("Insumo actualizado correctamente");
            }else {
                // Enviamos los datos parseados
                await createInsumo(payload);
                alert("Insumo creado correctamente");
            }

            setForm({id:null, nombre:"",categoria:"", stock:"", stock_minimo:"", estado:"activo"});
            setEditando(false);
            cargarInsumos();
        }catch (err) {
            console.error("Error al guardar insumo:", err);
            // Esta alerta ahora solo saltará si hay un error real de red o del servidor
            alert("No se pudo guardar insumo.");
        }
    };

    //Eliminar
    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este insumo?")) return;
        try {
            await deleteInsumo(id);
            alert("Insumo eliminado correctamente");
            cargarInsumos();
        } catch (err) {
            console.error("Error al eliminar insumo:" ,err);
            alert("Error al eliminar insumo.");
        }
    };

    //Editar
     const handleEdit = (insumo) => {
    // Los valores de stock vienen como números de la DB, se convierten a string
    // para que el <input type="number"> los maneje correctamente.
    setForm({
        ...insumo,
        stock: String(insumo.stock),
        stock_minimo: String(insumo.stock_minimo)
    });
    setEditando(true);
    };

    //Cancelar edicion 
     const handleCancel = () => {
    setForm({ id: null, nombre: "", categoria: "", stock: "", stock_minimo: "", estado: "activo" });
    setEditando(false);
  };

  return (
    <div className="insumos-container">
      <h2>Gestión de Insumos</h2>

      <form className="insumos-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input id="nombre" name="nombre" type="text" placeholder="Ej: Cloro 5L" value={form.nombre} onChange={handleChange}/>
        </div>

        <div className="form-group">
          <label htmlFor="categoria">Categoría:</label>
          <input id="categoria" name="categoria" type="text" placeholder="Ej: Limpieza" value={form.categoria} onChange={handleChange}/>
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock actual:</label>
          {/* El input type="number" sigue aceptando strings vacíos, por eso validamos en el submit */}
          <input id="stock" name="stock" type="number" placeholder="0" value={form.stock} onChange={handleChange}/>
        </div>

        <div className="form-group">
          <label htmlFor="stock_minimo">Stock mínimo:</label>
          <input id="stock_minimo" name="stock_minimo" type="number" placeholder="0" value={form.stock_minimo} onChange={handleChange}/>
        </div>

        <div className="form-group">
          <label htmlFor="estado">Estado:</label>
          <select id="estado" name="estado" value={form.estado} onChange={handleChange}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div className="form-group span-2">
          <button type="submit">{editando ? "Actualizar Insumo" : "Agregar Insumo"}</button>
          {editando && (
            <button type="button" className="cancel-btn" onClick={handleCancel}>Cancelar</button>
          )}
        </div>
      </form>

      <div className="insumos-table-container">
        <h3>Listado de Insumos</h3>
        {insumos.length === 0 ? (
          <p>No hay insumos registrados.</p>
        ) : (
          <table className="insumos-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Stock mínimo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {insumos.map((i) => (
                <tr key={i.id}>
                  <td>{i.nombre}</td>
                  <td>{i.categoria}</td>
                  <td>{i.stock}</td>
                  <td>{i.stock_minimo}</td>
                  <td className={i.estado === "activo" ? "estado-activo" : "estado-inactivo"}>{i.estado}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(i)}>Editar</button>
                    <button className="btn-delete" onClick={() => handleDelete(i.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default InventarioInsumos;
