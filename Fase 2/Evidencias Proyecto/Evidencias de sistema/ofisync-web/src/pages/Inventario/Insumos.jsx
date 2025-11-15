import React, {useState, useEffect} from "react";
import { getInsumos, createInsumo, updateInsumo, deleteInsumo } from "../../../services/insumoService";
import "./Insumos.css";
import { toast } from "sonner"; 

function InventarioInsumos(){
    const [insumos, setInsumos] = useState([]);
    const [editando, setEditando] = useState(false);
    const [form, setForm] = useState({
        id: null,
        nombre:"",
        categoria:"",
        stock:"", 
        stock_minimo:"", 
        estado: "" // <--- 1. AÑADIDO ESTADO AL FORM
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
            toast.error("Error al cargar los insumos.");
        }
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm((prev) => ({ ...prev, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- Validaciones (igual que antes) ---
        if(!form.nombre.trim() || !form.categoria) {
          toast.error("El nombre y la categoría son obligatorios");
          return;
        }
        const stockNum = parseInt(form.stock, 10);
        const stockMinNum = parseInt(form.stock_minimo, 10);
        if (form.stock === "" || isNaN(stockNum)) {
          toast.error("El stock es obligatorio y debe ser un número.");
          return; 
        }
        if (form.stock_minimo === "" || isNaN(stockMinNum)) {
          toast.error("El stock mínimo es obligatorio y debe ser un número.");
          return; 
        }
        if (stockNum < 0 || stockMinNum < 0) {
          toast.error("El stock no puede ser negativo.");
          return;
        } 

        // --- CORRECCIÓN EN LA LÓGICA DE GUARDADO ---
        try {
            // Creamos el payload base que requiere el backend
            // (El error 400 demuestra que 'estado' es obligatorio SIEMPRE)
            const payload = {
                nombre: form.nombre,
                categoria: form.categoria,
                stock: stockNum,
                stock_minimo: stockMinNum,
                // Si editamos, usamos el estado del form. Si creamos, 'Activo' por defecto.
                estado: editando ? form.estado : 'Activo' // <--- ESTA LÍNEA ES LA CLAVE
            };

            if(editando) {
                // El ID se pasa por URL, el payload NO debe llevar el ID.
                await updateInsumo(form.id, payload);
                toast.success("Insumo actualizado correctamente.");
            } else {
                // El payload no lleva ID, el backend lo genera.
                await createInsumo(payload);
                toast.success("Insumo creado correctamente.");
            }

            // Reseteamos el form (incluyendo el estado)
            setForm({id:null, nombre:"",categoria:"", stock:"", stock_minimo:"", estado: ""});
            setEditando(false);
            cargarInsumos();
        }catch (err) {
            console.error("Error al guardar insumo:", err);
            // El toast ahora mostrará el error específico (ej. 400 o 500)
            toast.error(`Error al guardar: ${err.message}`); 
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este insumo?")) return;
        
        try {
            await deleteInsumo(id);
            toast.success("Insumo eliminado.");
            cargarInsumos();
        } catch (err) {
            console.error("Error al eliminar insumo:" ,err);
            toast.error("Error al eliminar el insumo.");
        }
    };

     const handleEdit = (insumo) => {
    setForm({
        id: insumo.id,
        nombre: insumo.nombre,
        categoria: insumo.categoria,
        stock: String(insumo.stock),
        stock_minimo: String(insumo.stock_minimo),
        estado: insumo.estado // <--- 2. AÑADIDO (guarda el estado al editar)
    });
    setEditando(true);
    };

     const handleCancel = () => {
        // <--- 3. AÑADIDO (limpia el estado al cancelar)
        setForm({ id: null, nombre: "", categoria: "", stock: "", stock_minimo: "", estado: ""});
        setEditando(false);
    };

  return (
    <div className="insumos-container">
      <h2>Gestión de Insumos</h2>

      <form className="insumos-form" onSubmit={handleSubmit}>
        {/* ... (inputs de nombre, categoria, stock, stock_minimo) ... */}
        
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input id="nombre" name="nombre" type="text" placeholder="Ej: Cloro 5L" value={form.nombre} onChange={handleChange}/>
        </div>

        <div className="form-group">
          <label htmlFor="categoria">Categoría:</label>
          <select id ="categoria" name="categoria" value={form.categoria} onChange={handleChange}>
            <option value = ""disabled>Selecciona una categoria</option>
            <option value = "Limpieza">Limpieza</option>
            <option value = "Oficina">Oficina</option>
            <option value = "Otro">Otro</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock actual:</label>
          <input id="stock" name="stock" type="number" min="0" placeholder="0" value={form.stock} onChange={handleChange}/>
        </div>

        <div className="form-group">
          <label htmlFor="stock_minimo">Stock mínimo:</label>
          <input id="stock_minimo" name="stock_minimo" type="number" min ="0" placeholder="0" value={form.stock_minimo} onChange={handleChange}/>
        </div>

        {/* --- CAMPO 'ESTADO' (Solo visible al editar) --- */}
        {editando && (
            <div className="form-group">
                <label htmlFor="estado">Estado:</label>
                <select id="estado" name="estado" value={form.estado} onChange={handleChange}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                </select>
            </div>
        )}

        
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
                  <td className={i.estado && i.estado.toLowerCase() === "activo" ? "estado-activo" : "estado-inactivo"}>
                    {i.estado}
                  </td>
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