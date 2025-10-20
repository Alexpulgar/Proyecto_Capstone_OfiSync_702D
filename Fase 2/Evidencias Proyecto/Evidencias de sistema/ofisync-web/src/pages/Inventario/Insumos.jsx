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
        stock:"",
        stock_minimo:"",
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

        //validaciones simples
        if(!form.nombre.trim()) return alert("El nombre es obligatorio");
        if(form.stock < 0 || form.stock_minimo < 0) return alert("El stock no puede ser negativo");

        try {
            if(editando) {
                await updateInsumo(form.id, form);
                alert("Insumo actualizado correctamente");
            }else {
                await createInsumo(form)
                alert("Insumo creado correctamente");
            }

            setForm({id:null, nombre:"",categoria:"", stock:"", stock_minimo:"", estado:activo});
            setEditando(false);
            cargarInsumos();
        }catch (err) {
            console.error("Error al guarda insumo:", err);
            alert("No se pudo guardar insumo.");
        }
    };

    //Eliminar
    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar estye insumo?")) return;
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
    setForm(insumo);
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
