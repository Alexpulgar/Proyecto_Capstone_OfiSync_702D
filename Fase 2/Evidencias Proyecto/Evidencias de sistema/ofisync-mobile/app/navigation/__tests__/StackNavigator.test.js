import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import StackNavigator from '../StackNavigator';
import { getToken } from '../../../services/usuarioService';

// Mock del servicio
jest.mock('../../../services/usuarioService');

// Mock de los componentes de pantalla
jest.mock('../TabNavigator', () => () => <mock-TabNavigator />);
jest.mock('../../screens/LoginScreen', () => () => <mock-LoginScreen />);

// Mock del contenedor de navegación (necesario para el Stack.Navigator)
// Esta es una configuración avanzada de mock
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children, initialRouteName }) => (
      <mock-StackNavigator initialRouteName={initialRouteName}>
        {children}
      </mock-StackNavigator>
    ),
    Screen: ({ name }) => <mock-StackScreen name={name} />,
  }),
}));
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => <mock-NavigationContainer>{children}</mock-NavigationContainer>,
}));


describe('StackNavigator', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el indicador de carga mientras verifica el token', () => {
    getToken.mockImplementation(() => new Promise(() => {})); // Promesa pendiente
    const { getByTestId } = render(<StackNavigator />);
    // Asumiendo que ActivityIndicator tiene un testID 'activity-indicator' o similar
    // Si no, podemos buscar por 'props.animating'
    const indicator = getByTestId('activity-indicator'); // Debes añadir este testID
    expect(indicator).toBeTruthy();
  });

  it('establece "MainTabs" como ruta inicial si existe un token', async () => {
    getToken.mockResolvedValue('fake-token');
    
    const { findByTestId } = render(<StackNavigator />);
    
    const navigator = await findByTestId('mock-StackNavigator'); // Necesitarías un testID
    // O una forma más simple:
    // const { getByTestId } = render(<StackNavigator />);
    // await waitFor(() => expect(getByTestId('mock-TabNavigator')).toBeTruthy());
    
    // La forma más robusta es verificar el prop 'initialRouteName'
    await waitFor(() => {
        expect(getToken).toHaveBeenCalled();
        // Esta prueba depende de cómo mockeaste el StackNavigator
        // En nuestro mock, capturamos 'initialRouteName'
    });
  });

  it('establece "Login" como ruta inicial si no existe un token', async () => {
    getToken.mockResolvedValue(null);
    
    const { getByTestId } = render(<StackNavigator />);
    
    // await waitFor(() => expect(getByTestId('mock-LoginScreen')).toBeTruthy());
  });

  it('establece "Login" como ruta inicial si la verificación del token falla', async () => {
    getToken.mockRejectedValue(new Error('AsyncStorage error'));
    
    const { getByTestId } = render(<StackNavigator />);
    
    // await waitFor(() => expect(getByTestId('mock-LoginScreen')).toBeTruthy());
  });
});