import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginApi, logout, getToken, getUsuario } from '../usuarioService';

// Mock de la API_URL (ajusta la ruta si es necesario)
jest.mock('../usuarioService', () => {
  const originalModule = jest.requireActual('../usuarioService');
  return {
    ...originalModule,
    __esModule: true,
    API_URL: "http://mock-api.com/api/usuarios",
  };
});

// Mock de fetch
global.fetch = jest.fn();

describe('usuarioService', () => {
  
  beforeEach(() => {
    fetch.mockClear();
    AsyncStorage.clear();
  });

  describe('loginApi', () => {
    it('debe guardar el token y el usuario en caso de éxito', async () => {
      const mockCreds = { nombre_usuario: 'user', contrasena: 'pass' };
      const mockResponse = { 
        token: 'fake-token-123', 
        usuario: { id: 1, nombre: 'Test User' } 
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await loginApi(mockCreds);

      expect(fetch).toHaveBeenCalledWith("http://mock-api.com/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockCreds),
      });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', 'fake-token-123');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('usuario', JSON.stringify(mockResponse.usuario));
      expect(result).toEqual(mockResponse);
    });

    it('debe lanzar un error si las credenciales son incorrectas', async () => {
      const mockCreds = { nombre_usuario: 'user', contrasena: 'wrong' };
      const mockError = { error: 'Credenciales inválidas' };

      fetch.mockResolvedValue({
        ok: false,
        json: async () => mockError,
      });

      await expect(loginApi(mockCreds)).rejects.toThrow('Credenciales inválidas');
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('debe remover el token y el usuario de AsyncStorage', async () => {
      await logout();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('usuario');
    });
  });

  describe('getToken', () => {
    it('debe retornar el token desde AsyncStorage', async () => {
      AsyncStorage.getItem.mockResolvedValue('my-token');
      const token = await getToken();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('authToken');
      expect(token).toBe('my-token');
    });
  });

  describe('getUsuario', () => {
    it('debe retornar el objeto de usuario parseado', async () => {
      const user = { id: 1 };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(user));
      const result = await getUsuario();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('usuario');
      expect(result).toEqual(user);
    });

    it('debe retornar null si no hay usuario', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      const result = await getUsuario();
      expect(result).toBeNull();
    });

    it('debe hacer logout y retornar null si el JSON está corrupto', async () => {
      AsyncStorage.getItem.mockResolvedValue('{corrupt_json');
      const result = await getUsuario();
      
      // Verifica que se llamó a logout (que a su vez llama a removeItem)
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('usuario');
      expect(result).toBeNull();
    });
  });
});