const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const API_URL = `${BASE_URL}/usuarios`;

export async function registrarUsuarioApi(datosUsuario) {
  const res = await fetch(`${API_URL}/registrar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(datosUsuario),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error desconocido al registrar usuario");
  }

  return data;
}

export async function loginApi(credenciales) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(credenciales),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error desconocido durante el login");
  }

  if (data.token) {
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
  }

  return data;
}

export function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("usuario");
}

export function getToken() {
  return localStorage.getItem("authToken");
}

export function getUsuario() {
  const usuario = localStorage.getItem("usuario");
  try {
    return usuario ? JSON.parse(usuario) : null;
  } catch (e) {
    console.error("Error al parsear datos de usuario desde localStorage", e);
    localStorage.removeItem("usuario");
    localStorage.removeItem("authToken");
    return null;
  }
}
