import React, { useState, useEffect } from "react";
import { calcularGastoComunApi } from "../../services/gastoComunService";
import { getEdificios } from "../../services/edificioService";
import "./GastoComun.css"; // <-- Asegúrate de que este archivo CSS exista

function CalcularGastoComun() {
  const [edificios, setEdificios] = useState([]);
  const [form, setForm] = useState({
    edificio_id: "",
    mes: "", // El estado guardará el formato "YYYY-MM" del input
    descripcion: "",
    gastos: {
      luz: "",
      agua: "",
      mantencion: "",
      otros: ""
    }
  });

  useEffect(() => {
    getEdificios()
      .then((data) => setEdificios(data))
      .catch((err) => console.error("Error al cargar edificios:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Si el campo pertenece a los gastos, actualizamos el estado anidado
    if (['luz', 'agua', 'mantencion', 'otros'].includes(name)) {
      setForm({
        ...form,
        gastos: {
          ...form.gastos,
          [name]: value
        }
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Función para formatear "YYYY-MM" al formato "Mes Año" que quieres guardar
  const formatMonthForAPI = (monthString) => {
    if (!monthString) return "";
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('es-CL', { month: 'long', year: 'numeric' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalCalculado = Object.values(form.gastos).reduce((sum, current) => sum + (Number(current) || 0), 0);
    const mesFormateado = formatMonthForAPI(form.mes);

    if (!form.edificio_id || !mesFormateado || totalCalculado <= 0) {
      alert("Debe seleccionar un edificio, un mes y el total debe ser mayor a cero.");
      return;
    }

    try {
      const data = await calcularGastoComunApi({
        edificio_id: parseInt(form.edificio_id),
        mes: mesFormateado,
        total: totalCalculado,
        luz: Number(form.gastos.luz) || 0,
        agua: Number(form.gastos.agua) || 0,
        mantencion: Number(form.gastos.mantencion) || 0,
        otros: Number(form.gastos.otros) || 0,
        descripcion: form.descripcion,
      });

      if (data.error) throw new Error(data.error);

      alert(
        `${data.mensaje}\n💵 Gasto por m²: $${data.gasto_por_m2}`
      );

      // Limpiamos el formulario después de enviarlo
      setForm({
        edificio_id: "",
        mes: "",
        descripcion: "",
        gastos: { luz: "", agua: "", mantencion: "", otros: "" }
      });
    } catch (err) {
      alert("Error al calcular gasto común: " + err.message);
    }
  };

  // Calculamos el total en tiempo real para mostrarlo en el formulario
  const totalCalculado = Object.values(form.gastos).reduce((sum, current) => sum + (Number(current) || 0), 0);

  return (
    <div className="gasto-comun-container">
      <h2>Calcular Gasto Común</h2>
      <form onSubmit={handleSubmit} className="gasto-comun-form">
        
        <div className="form-group span-2">
          <label htmlFor="edificio_id">Edificio:</label>
          <select id="edificio_id" name="edificio_id" value={form.edificio_id} onChange={handleChange}>
            <option value="">Seleccione un edificio</option>
            {edificios.map((edificio) => (
              <option key={edificio.id} value={edificio.id}>{edificio.nombre}</option>
            ))}
          </select>
        </div>

        <div className="form-group span-2">
          <label htmlFor="mes">Mes:</label>
          <input
            id="mes"
            type="month"
            name="mes"
            value={form.mes}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="luz">Gasto Luz ($):</label>
          <input id="luz" type="number" name="luz" value={form.gastos.luz} onChange={handleChange} placeholder="0" />
        </div>

        <div className="form-group">
          <label htmlFor="agua">Gasto Agua ($):</label>
          <input id="agua" type="number" name="agua" value={form.gastos.agua} onChange={handleChange} placeholder="0" />
        </div>

        <div className="form-group">
          <label htmlFor="mantencion">Gasto Mantención ($):</label>
          <input id="mantencion" type="number" name="mantencion" value={form.gastos.mantencion} onChange={handleChange} placeholder="0" />
        </div>

        <div className="form-group">
          <label htmlFor="otros">Otros Gastos ($):</label>
          <input id="otros" type="number" name="otros" value={form.gastos.otros} onChange={handleChange} placeholder="0" />
        </div>
        
        <div className="form-group span-2">
          <label htmlFor="descripcion">Descripción (opcional):</label>
          <textarea id="descripcion" name="descripcion" value={form.descripcion} onChange={handleChange} />
        </div>

        <div className="total-display span-2">
          <h3>Total Calculado: $ {totalCalculado.toLocaleString('es-CL')}</h3>
        </div>

        <div className="form-group span-2">
          <button type="submit">Calcular Gasto</button>
        </div>
      </form>
    </div>
  );
}

export default CalcularGastoComun;