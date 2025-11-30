import axios from "axios";
import { getToken } from "../../services/usuarioService";

const API_URL = "https://api.ofisync.xyz/api";

const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn("Error obteniendo token:", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
