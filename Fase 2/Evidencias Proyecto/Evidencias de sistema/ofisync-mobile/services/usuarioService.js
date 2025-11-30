// ofisync-mobile/services/usuarioService.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://api.ofisync.xyz/api/usuarios";

export async function loginApi(credenciales) {
  // credenciales = { nombre_usuario, contrasena }
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credenciales),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error desconocido durante el login");
  }

  // Si el login fue exitoso, guarda el token y los datos del usuario
  if (data.token) {
    // Usamos AsyncStorage en lugar de localStorage
    await AsyncStorage.setItem("authToken", data.token);
    await AsyncStorage.setItem("usuario", JSON.stringify(data.usuario));
  }

  return data; // Devuelve { message, token, usuario }
}

// (Opcional) Funciones adaptadas a AsyncStorage
export async function logout() {
  await AsyncStorage.removeItem("authToken");
  await AsyncStorage.removeItem("usuario");
}

export async function getToken() {
  return await AsyncStorage.getItem("authToken");
}

export async function getUsuario() {
  const usuario = await AsyncStorage.getItem("usuario");
  try {
    return usuario ? JSON.parse(usuario) : null;
  } catch (e) {
    console.error("Error al parsear datos de usuario desde AsyncStorage", e);
    await logout(); // Limpia datos corruptos
    return null;
  }
}
