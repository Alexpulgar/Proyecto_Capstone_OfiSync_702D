import API from '../api';
import { getToken } from '../../../services/usuarioService';

// Mock del servicio de usuario
jest.mock('../../../services/usuarioService', () => ({
  getToken: jest.fn(),
}));

describe('API interceptor', () => {

  beforeEach(() => {
    // Resetea los mocks antes de cada prueba
    getToken.mockClear();
  });

  it('debe añadir el header de Autorización si el token existe', async () => {
    getToken.mockResolvedValue('fake-token-123');

    // El interceptor se dispara *antes* de la solicitud.
    // Atrapamos la configuración de la solicitud.
    const requestPromise = API.interceptors.request.handlers[0].fulfilled({ headers: {} });
    
    // Esperamos a que la promesa del interceptor se resuelva
    const config = await requestPromise;

    expect(getToken).toHaveBeenCalled();
    expect(config.headers['Authorization']).toBe('Bearer fake-token-123');
  });

  it('no debe añadir el header de Autorización si el token no existe', async () => {
    getToken.mockResolvedValue(null);

    const requestPromise = API.interceptors.request.handlers[0].fulfilled({ headers: {} });
    const config = await requestPromise;

    expect(getToken).toHaveBeenCalled();
    expect(config.headers['Authorization']).toBeUndefined();
  });

  it('debe rechazar la promesa si el interceptor falla', async () => {
    const error = new Error('Failed');
    const rejectedPromise = API.interceptors.request.handlers[0].rejected(error);
    
    await expect(rejectedPromise).rejects.toThrow('Failed');
  });
});