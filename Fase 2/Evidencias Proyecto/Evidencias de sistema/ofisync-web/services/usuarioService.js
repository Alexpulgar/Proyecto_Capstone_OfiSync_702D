// services/usuarioService.js
const API_URL = "http://localhost:4000/api/usuarios"; // Ajusta si cambiaste la ruta base en el backend

export async function registrarUsuarioApi(datosUsuario) {
  // datosUsuario debe ser un objeto: { nombre_usuario, contrasena, rol? }
  const res = await fetch(`${API_URL}/registrar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosUsuario)
  });

  const data = await res.json();
  
  // Si la respuesta no fue OK (ej: 400 por usuario duplicado), lanza el error del backend
  if (!res.ok) {
    throw new Error(data.error || "Error desconocido al registrar usuario");
  }
  
  return data; // Devuelve el objeto del usuario creado (sin contraseña)
}

export async function loginApi(credenciales) {
  // credenciales = { nombre_usuario, contrasena }
  const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credenciales)
  });

  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || "Error desconocido durante el login");
  }

  // Si el login fue exitoso, guarda el token y los datos del usuario
  if (data.token) {
    localStorage.setItem('authToken', data.token); // Guarda el token
    localStorage.setItem('usuario', JSON.stringify(data.usuario)); // Guarda info del usuario
  }
  
  return data; // Devuelve { message, token, usuario }
}

// (Opcional) Función para cerrar sesión
export function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario');
}

// (Opcional) Función para obtener el token guardado
export function getToken() {
    return localStorage.getItem('authToken');
}



export function getUsuario() {
    const usuario = localStorage.getItem('usuario');
    // Devuelve el objeto del usuario parseado, o null si no existe/no es válido
    try {
        return usuario ? JSON.parse(usuario) : null;
    } catch (e) {
        console.error("Error al parsear datos de usuario desde localStorage", e);
        // Limpia datos corruptos si los hubiera
        localStorage.removeItem('usuario');
        localStorage.removeItem('authToken');
        return null;
    }
}