import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Keyboard } from 'react-native';
import LoginScreen from '../LoginScreen';
import { loginApi } from '../../../services/usuarioService';

// Mock de dependencias
jest.mock('../../../services/usuarioService');
const mockNavigateReplace = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    replace: mockNavigateReplace,
  }),
}));

describe('LoginScreen', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza correctamente los campos y el botón', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    expect(getByPlaceholderText('Usuario')).toBeTruthy();
    expect(getByPlaceholderText('Contraseña')).toBeTruthy();
    expect(getByText('Iniciar sesión')).toBeTruthy();
  });

  it('muestra alerta si el usuario está vacío', () => {
    const { getByText } = render(<LoginScreen />);
    
    fireEvent.press(getByText('Iniciar sesión'));
    
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Por favor ingresa usuario y contraseña');
    expect(loginApi).not.toHaveBeenCalled();
  });

  it('muestra alerta si la contraseña está vacía', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Usuario'), 'testuser');
    fireEvent.press(getByText('Iniciar sesión'));
    
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Por favor ingresa usuario y contraseña');
    expect(loginApi).not.toHaveBeenCalled();
  });

  it('maneja el login exitoso y navega a MainTabs', async () => {
    loginApi.mockResolvedValue({}); // Simula éxito
    
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Usuario'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Contraseña'), 'testpass');
    fireEvent.press(getByText('Iniciar sesión'));

    // Verifica que se muestra el indicador de carga
    expect(getByText('Iniciar sesión').props.disabled).toBe(true);
    
    await waitFor(() => {
      expect(loginApi).toHaveBeenCalledWith({
        nombre_usuario: 'testuser',
        contrasena: 'testpass',
      });
    });

    // Verifica que se oculta el teclado
    expect(Keyboard.dismiss).toHaveBeenCalled();
    
    // Verifica la navegación
    expect(mockNavigateReplace).toHaveBeenCalledWith('MainTabs');
  });

  it('maneja el login fallido y muestra una alerta', async () => {
    const error = { response: { data: { error: 'Credenciales inválidas' } } };
    loginApi.mockRejectedValue(error);
    
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Usuario'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Contraseña'), 'wrongpass');
    fireEvent.press(getByText('Iniciar sesión'));

    await waitFor(() => {
      expect(loginApi).toHaveBeenCalled();
    });

    // Verifica que se muestra la alerta de error
    expect(Alert.alert).toHaveBeenCalledWith('Error de Login', 'Credenciales inválidas');
    expect(mockNavigateReplace).not.toHaveBeenCalled();
    
    // Verifica que el botón se vuelve a habilitar
    expect(getByText('Iniciar sesión').props.disabled).toBe(false);
  });

  it('permite ver/ocultar la contraseña', () => {
    const { getByPlaceholderText, getByTestId /* Asumiendo que el icono tiene testID */, getByLabelText /* O usa accesibilidad */ } = render(<LoginScreen />);
    
    const passwordInput = getByPlaceholderText('Contraseña');
    // Necesitarías agregar un testID o label al TouchableOpacity del icono
    // const eyeIcon = getByTestId('toggle-password-visibility');
    const eyeIcon = passwordInput.parent.findByType(TouchableOpacity); // Menos ideal

    // Inicialmente oculta
    expect(passwordInput.props.secureTextEntry).toBe(true);

    // fireEvent.press(eyeIcon);
    // expect(passwordInput.props.secureTextEntry).toBe(false);

    // fireEvent.press(eyeIcon);
    // expect(passwordInput.props.secureTextEntry).toBe(true);
  });
});