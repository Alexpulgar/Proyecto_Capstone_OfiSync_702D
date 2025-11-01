import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import StackNavigator from '../StackNavigator';
import { getToken } from '../../../services/usuarioService';

// Mock del servicio
jest.mock('../../../services/usuarioService');

// Mock de los componentes de pantalla
jest.mock('../TabNavigator', () => () => <mock-TabNavigator testID="mock-TabNavigator" />);
jest.mock('../../screens/LoginScreen', () => () => <mock-LoginScreen testID="mock-LoginScreen" />);


describe('StackNavigator', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el indicador de carga mientras verifica el token', () => {
    getToken.mockImplementation(() => new Promise(() => {})); 
    
    const { getByTestId } = render(<StackNavigator />);
    const indicator = getByTestId('loading-indicator'); 
    expect(indicator).toBeTruthy();
  });

  it('establece "MainTabs" como ruta inicial si existe un token', async () => {
    getToken.mockResolvedValue('fake-token');
    
    const { findByTestId } = render(<StackNavigator />);
    
    const tabNavigator = await findByTestId('mock-TabNavigator');
    
    expect(tabNavigator).toBeTruthy();
    expect(getToken).toHaveBeenCalled();
  });

  it('establece "Login" como ruta inicial si no existe un token', async () => {
    getToken.mockResolvedValue(null);
    
    const { findByTestId } = render(<StackNavigator />);
    
    const loginScreen = await findByTestId('mock-LoginScreen');
    
    expect(loginScreen).toBeTruthy();
    expect(getToken).toHaveBeenCalled();
  });

  it('establece "Login" como ruta inicial si la verificación del token falla', async () => {
    getToken.mockRejectedValue(new Error('AsyncStorage error'));
    
    const { findByTestId } = render(<StackNavigator />);
    
    const loginScreen = await findByTestId('mock-LoginScreen');
    
    expect(loginScreen).toBeTruthy();
    expect(getToken).toHaveBeenCalled();
  });
});