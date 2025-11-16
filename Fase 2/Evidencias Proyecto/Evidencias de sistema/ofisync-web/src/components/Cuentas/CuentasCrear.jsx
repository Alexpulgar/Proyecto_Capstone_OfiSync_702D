import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registrarUsuarioApi } from "../../../services/usuarioService";
import { getPersonas } from "../../../services/personaService";
import "../Agregar/agregar.css";

function CrearUsuario() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre_usuario: "",
    contrasena: "",
    confirmarContrasena: "",
    rol: "usuario",
    persona_id: "",
  });
  const [cargando, setCargando] = useState(false);
  const [personas, setPersonas] = useState([]);

  // Cargar las personas al montar
  useEffect(() => {
    const cargarPersonas = async () => {
      try {
        // Obtenemos todas las personas
        const todasLasPersonas = await getPersonas();
        setPersonas(todasLasPersonas); // Guardamos todas las personas
      } catch (err) {
        console.error("Error al cargar personas:", err);
        alert("No se pudo cargar la lista de personas.");
      }
    };

    cargarPersonas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => {
      const newForm = { ...prevForm, [name]: value };

      if (name === "rol" && value !== "usuario") {
        newForm.persona_id = "";
      }

      return newForm;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!form.nombre_usuario || !form.contrasena || !form.confirmarContrasena) {
      alert("Todos los campos son obligatorios.");
      return;
    }
    if (form.contrasena !== form.confirmarContrasena) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    if (form.contrasena.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (form.rol === "usuario" && !form.persona_id) {
      alert(
        "Debe seleccionar una persona para asignar a esta cuenta de rol 'Usuario'."
      );
      return;
    }

    try {
      setCargando(true);
      const datosParaApi = {
        nombre_usuario: form.nombre_usuario,
        contrasena: form.contrasena,
        rol: form.rol,
        persona_id: form.rol === "usuario" ? form.persona_id : null,
      };

      const data = await registrarUsuarioApi(datosParaApi);
      alert(`Usuario "${data.nombre_usuario}" creado con éxito.`);
      setForm({
        nombre_usuario: "",
        contrasena: "",
        confirmarContrasena: "",
        rol: "usuario",
        persona_id: "",
      });
    } catch (err) {
      alert("Error al crear usuario: " + (err.message || "Error desconocido"));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="contenedorAgregar">
      <h2>Crear Nueva Cuenta de Usuario</h2>
      <form onSubmit={handleSubmit} className="agregar-form">
        {/* Nombre de Usuario */}
        <div className="form-group">
          <label htmlFor="nombre_usuario">Nombre de Usuario</label>
          <input
            id="nombre_usuario"
            type="text"
            name="nombre_usuario"
            value={form.nombre_usuario}
            onChange={handleChange}
            required
          />
        </div>

        {/* Selector de Rol */}
        <div className="form-group">
          <label htmlFor="rol">Rol</label>
          <select id="rol" name="rol" value={form.rol} onChange={handleChange}>
            <option value="usuario">Usuario</option>
            <option value="admin">Administrador</option>
            <option value="conserje">Conserje</option>
            <option value="personalAseo">Personal de aseo</option>
          </select>
        </div>

        {/* Selector de Persona */}
        {form.rol === "usuario" && (
          <div className="form-group">
            <label htmlFor="persona_id">Asignar a Persona</label>
            <select
              id="persona_id"
              name="persona_id"
              value={form.persona_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Seleccione una persona --</option>
              {personas.length > 0 ? (
                personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.nombre}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  Cargando personas...
                </option>
              )}
            </select>
          </div>
        )}

        {/* Contraseña */}
        <div className="form-group">
          <label htmlFor="contrasena">Contraseña (mín. 6 caracteres)</label>
          <input
            id="contrasena"
            type="password"
            name="contrasena"
            value={form.contrasena}
            onChange={handleChange}
            required
          />
        </div>

        {/* Confirmar Contraseña */}
        <div className="form-group">
          <label htmlFor="confirmarContrasena">Confirmar Contraseña</label>
          <input
            id="confirmarContrasena"
            type="password"
            name="confirmarContrasena"
            value={form.confirmarContrasena}
            onChange={handleChange}
            required
          />
        </div>

        {/* Botón de envío */}
        <div className="form-group span-full">
          <button type="submit" disabled={cargando}>
            {cargando ? "Creando Usuario..." : "Crear Usuario"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CrearUsuario;
