import React, { useState, useEffect } from "react";
import {
  getInsumos,
  createInsumo,
  updateInsumo,
  deleteInsumo,
} from "../../../services/insumoService";
import "./Insumos.css";

function InventarioInsumos() {
  const [insumos, setInsumos] = useState([]);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    categoria: "",
    stock: "",
    stock_minimo: "",
  });

  useEffect(() => {
    cargarInsumos();
  }, []);

  const cargarInsumos = async () => {
    try {
      const data = await getInsumos();
      setInsumos(data);
    } catch (err) {
      console.error("Error al cargar insumos:", err);
    }
  };

  //Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  //guardar o actualizar
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim() || !form.categoria) {
      console.error("El nombre y la categoria son obligatorios");
      return;
    }

    const stockNum = parseInt(form.stock, 10);
    const stockMinNum = parseInt(form.stock_minimo, 10);

    if (form.stock === "" || isNaN(stockNum)) {
      console.error("El stock es obligatorio y tiene que ser un numero.");
      return;
    }
    if (form.stock_minimo === "" || isNaN(stockMinNum)) {
      console.error(
        "El stock minimo es obligatorio y tiene que ser un numero."
      );
      return;
    }

    // Comprobar que no sean negativos
    if (stockNum < 0) {
      console.error("El stock actual no puede ser negativo");
      return;
    }
    if (stockMinNum < 0) {
      console.error("El stock minimo no puede ser negativo");
      return;
    }

    try {
      const payload = { ...form, stock: stockNum, stock_minimo: stockMinNum };

      if (editando) {
        await updateInsumo(form.id, payload);
      } else {
        // Enviamos los datos parseados
        await createInsumo(payload);
      }

      setForm({
        id: null,
        nombre: "",
        categoria: "",
        stock: "",
        stock_minimo: "",
      });
      setEditando(false);
      cargarInsumos();
    } catch (err) {
      console.error("Error al guardar insumo:", err);
    }
  };

  //Eliminar
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este insumo?")) return;
    try {
      await deleteInsumo(id);
      cargarInsumos();
    } catch (err) {
      console.error("Error al eliminar insumo:", err);
    }
  };

  //Editar
  const handleEdit = (insumo) => {
    setForm({
      id: insumo.id,
      nombre: insumo.nombre,
      categoria: insumo.categoria,
      stock: String(insumo.stock),
      stock_minimo: String(insumo.stock_minimo),
    });
    setEditando(true);
  };

  //Cancelar edicion
  const handleCancel = () => {
    setForm({
      id: null,
      nombre: "",
      categoria: "",
      stock: "",
      stock_minimo: "",
    });
    setEditando(false);
  };

  return (
    <div className="insumos-container">
      <h2>Gestión de Insumos</h2>

      <form className="insumos-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            placeholder="Ej: Cloro 5L"
            value={form.nombre}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="categoria">Categoría:</label>
          <select
            id="categoria"
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
          >
            <option value="" disabled>
              Selecciona una categoria
            </option>
            <option value="Limpieza">Limpieza</option>
            <option value="Oficina">Oficina</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock actual:</label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            placeholder="0"
            value={form.stock}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="stock_minimo">Stock mínimo:</label>
          <input
            id="stock_minimo"
            name="stock_minimo"
            type="number"
            min="0"
            placeholder="0"
            value={form.stock_minimo}
            onChange={handleChange}
          />
        </div>

        <div className="form-group span-2">
          <button type="submit">
            {editando ? "Actualizar Insumo" : "Agregar Insumo"}
          </button>
          {editando && (
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancelar
            </button>
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
                  <td
                    className={
                      i.estado === "activo"
                        ? "estado-activo"
                        : "estado-inactivo"
                    }
                  >
                    {i.estado}
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(i)}>
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(i.id)}
                    >
                      Eliminar
                    </button>
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
