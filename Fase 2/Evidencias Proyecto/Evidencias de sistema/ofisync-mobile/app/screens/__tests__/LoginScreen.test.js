import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Keyboard, TouchableOpacity } from 'react-native'; 
import LoginScreen from '../LoginScreen';
import { loginApi } from '../../../services/usuarioService';

// Mock de dependencias
jest.mock('../../../services/usuarioService');

const mockNavigateReplace = jest.fn();
const mockNavigation = { replace: mockNavigateReplace };


describe('LoginScreen', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigateReplace.mockClear(); 
  });

  it('renderiza correctamente los campos y el botón', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={mockNavigation} />);
    
    expect(getByPlaceholderText('Usuario')).toBeTruthy();
    expect(getByPlaceholderText('Contraseña')).toBeTruthy();
    expect(getByText('Iniciar sesión')).toBeTruthy();
  });

  it('muestra alerta si el usuario está vacío', () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);
    
    fireEvent.press(getByText('Iniciar sesión'));
    
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Por favor ingresa usuario y contraseña');
    expect(loginApi).not.toHaveBeenCalled();
  });

  it('muestra alerta si la contraseña está vacía', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen navigation={mockNavigation} />);
    
    fireEvent.changeText(getByPlaceholderText('Usuario'), 'testuser');
    fireEvent.press(getByText('Iniciar sesión'));
    
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Por favor ingresa usuario y contraseña');
    expect(loginApi).not.toHaveBeenCalled();
  });

  it('maneja el login exitoso y navega a MainTabs', async () => {
    loginApi.mockResolvedValue({}); 
    
    const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Usuario'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Contraseña'), 'testpass');
    fireEvent.press(getByText('Iniciar sesión'));

    expect(getByTestId('loading-indicator')).toBeTruthy();
    expect(queryByText('Iniciar sesión')).toBeNull();
    
    await waitFor(() => {
      expect(mockNavigateReplace).toHaveBeenCalledWith('MainTabs');
    });

    expect(loginApi).toHaveBeenCalledWith({
      nombre_usuario: 'testuser',
      contrasena: 'testpass',
    });
    
    expect(Keyboard.dismiss).toHaveBeenCalled();
  });

  it('maneja el login fallido y muestra una alerta', async () => {
    const error = { response: { data: { error: 'Credenciales inválidas' } } };
    loginApi.mockRejectedValue(error);
    
    const { getByText, getByPlaceholderText, getByTestId, queryByTestId } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Usuario'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Contraseña'), 'wrongpass');
    fireEvent.press(getByText('Iniciar sesión'));

    expect(getByTestId('loading-indicator')).toBeTruthy();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error de Login', 'Credenciales inválidas');
    });
    
    expect(loginApi).toHaveBeenCalled();
    expect(mockNavigateReplace).not.toHaveBeenCalled();
    
    expect(queryByTestId('loading-indicator')).toBeNull();
    expect(getByText('Iniciar sesión')).toBeTruthy();
  });

  it('permite ver/ocultar la contraseña', () => {
    const { getByPlaceholderText, getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    
    const passwordInput = getByPlaceholderText('Contraseña');
    const eyeIcon = getByTestId('toggle-password-icon');

    expect(passwordInput.props.secureTextEntry).toBe(true);

    fireEvent.press(eyeIcon);
    expect(passwordInput.props.secureTextEntry).toBe(false);

    fireEvent.press(eyeIcon);
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });
});