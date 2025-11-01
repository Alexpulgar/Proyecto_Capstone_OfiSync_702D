import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProfileScreen from '../ProfileScreen';
import API from '../../api/api';
import { getUsuario, logout } from '../../../services/usuarioService';

// Mocks
jest.mock('../../api/api');
jest.mock('../../../services/usuarioService');
const mockNavigateReplace = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    replace: mockNavigateReplace,
  }),
  useFocusEffect: (callback) => {
    jest.requireActual('react').useEffect(callback, []);
  },
}));

const mockUser = { id: 1, persona_id: 10, nombre_usuario: 'testuser' };
const mockPersona = { id: 10, rut: '11.111.111-1', nombre: 'Test User', correo: 'test@test.com', telefono: '987654321' };

describe('ProfileScreen', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    getUsuario.mockResolvedValue(mockUser);
    API.get.mockResolvedValue({ data: mockPersona });
    API.put.mockResolvedValue({ data: { ...mockPersona, correo: 'new@test.com' } });
    API.post.mockResolvedValue({ data: { message: 'Código enviado' } });
  });

  it('carga y muestra los datos del usuario', async () => {
    const { findByDisplayValue } = render(<ProfileScreen />);
    
    expect(await findByDisplayValue('testuser')).toBeTruthy();
    expect(await findByDisplayValue('11.111.111-1')).toBeTruthy();
    expect(await findByDisplayValue('Test User')).toBeTruthy();
    expect(await findByDisplayValue('test@test.com')).toBeTruthy();
    expect(await findByDisplayValue('987654321')).toBeTruthy();
  });

  it('permite editar y guardar datos personales', async () => {
    const { getByText, getByDisplayValue } = render(<ProfileScreen />);
    
    // Espera a que carguen los datos
    await waitFor(() => expect(getByDisplayValue('test@test.com')).toBeTruthy());

    // Click en Editar
    fireEvent.press(getByText('Editar Datos'));
    
    const emailInput = getByDisplayValue('test@test.com');
    const phoneInput = getByDisplayValue('987654321');
    
    expect(emailInput.props.editable).toBe(true);
    expect(phoneInput.props.editable).toBe(true);
    
    // Modifica datos
    fireEvent.changeText(emailInput, 'new@test.com');
    fireEvent.changeText(phoneInput, '912345678');
    
    // Click en Guardar
    fireEvent.press(getByText('Guardar Cambios'));

    await waitFor(() => {
      expect(API.put).toHaveBeenCalledWith('/personas/10', {
        correo: 'new@test.com',
        telefono: '912345678',
      });
    });

    expect(Alert.alert).toHaveBeenCalledWith('Éxito', 'Datos actualizados correctamente.');
    // Verifica que los campos ya no son editables
    expect(getByDisplayValue('new@test.com').props.editable).toBe(false);
  });

  it('valida el formato de email al guardar', async () => {
    const { getByText, getByDisplayValue } = render(<ProfileScreen />);
    await waitFor(() => expect(getByText('Editar Datos')).toBeTruthy());

    fireEvent.press(getByText('Editar Datos'));
    fireEvent.changeText(getByDisplayValue('test@test.com'), 'email-invalido');
    fireEvent.press(getByText('Guardar Cambios'));

    expect(Alert.alert).toHaveBeenCalledWith('Error de Validación', 'Por favor ingresa un correo electrónico válido.');
    expect(API.put).not.toHaveBeenCalled();
  });

  it('maneja el flujo de cambio de contraseña completo', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<ProfileScreen />);
    await waitFor(() => expect(getByText('Cambiar')).toBeTruthy()); // Espera a que cargue

    // 1. Solicitar código
    fireEvent.press(getByText('Cambiar'));
    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith('/usuarios/solicitar-codigo');
    });
    expect(Alert.alert).toHaveBeenCalledWith('Código Enviado', expect.any(String));
    expect(getByPlaceholderText('Ingresa el código de 6 dígitos')).toBeTruthy();

    // 2. Verificar código (falla por validación)
    fireEvent.changeText(getByPlaceholderText('Ingresa el código de 6 dígitos'), '123');
    fireEvent.press(getByText('Verificar Código'));
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'El código debe ser de 6 dígitos numéricos.');
    
    // 2b. Verificar código (falla API)
    API.post.mockRejectedValueOnce({ response: { data: { error: 'Código inválido' } } });
    fireEvent.changeText(getByPlaceholderText('Ingresa el código de 6 dígitos'), '123456');
    fireEvent.press(getByText('Verificar Código'));
    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith('/usuarios/verificar-codigo', { code: '123456' });
    });
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Código inválido');

    // 2c. Verificar código (éxito)
    API.post.mockResolvedValueOnce({});
    fireEvent.press(getByText('Verificar Código')); // Ya tiene '123456'
    await waitFor(() => {
      expect(getByPlaceholderText('Nueva Contraseña')).toBeTruthy();
      expect(getByPlaceholderText('Confirmar Contraseña')).toBeTruthy();
    });

    // 3. Actualizar contraseña (falla validación)
    fireEvent.changeText(getByPlaceholderText('Nueva Contraseña'), 'newpass');
    fireEvent.changeText(getByPlaceholderText('Confirmar Contraseña'), 'mismatch');
    fireEvent.press(getByText('Actualizar Contraseña'));
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Las contraseñas no coinciden.');

    // 3b. Actualizar contraseña (éxito)
    API.put.mockResolvedValueOnce({});
    fireEvent.changeText(getByPlaceholderText('Nueva Contraseña'), 'newSecurePass');
    fireEvent.changeText(getByPlaceholderText('Confirmar Contraseña'), 'newSecurePass');
    fireEvent.press(getByText('Actualizar Contraseña'));

    await waitFor(() => {
      expect(API.put).toHaveBeenCalledWith('/usuarios/actualizar-password', {
        code: '123456',
        newPassword: 'newSecurePass',
      });
    });
    
    expect(Alert.alert).toHaveBeenCalledWith('Éxito', 'Contraseña actualizada. Serás desconectado por seguridad.');
    expect(logout).toHaveBeenCalled();
    expect(mockNavigateReplace).toHaveBeenCalledWith('Login');
  });

  it('maneja el cierre de sesión', async () => {
    const { getByText } = render(<ProfileScreen />);
    await waitFor(() => expect(getByText('Cerrar Sesión')).toBeTruthy());

    // Mockeamos la implementación de Alert.alert para simular el "OK"
    Alert.alert.mockImplementationOnce((title, msg, buttons) => {
      buttons[1].onPress(); // Simula presionar "Sí, Cerrar Sesión"
    });

    fireEvent.press(getByText('Cerrar Sesión'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      expect.any(Array)
    );
    
    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
      expect(mockNavigateReplace).toHaveBeenCalledWith('Login');
    });
  });
});