import axios from "axios";
import { getToken } from "../../services/usuarioService";
const API_URL = "https://44.201.96.82:4000/api";

const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  async (config) => {
    // 1. Obtener el token de AsyncStorage antes de cada petición
    const token = await getToken();

    // 2. Si el token existe, añadirlo a la cabecera Authorization
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
