import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import ServicesScreen from '../app/screens/ServicesScreen';
import API from '../app/api/api';

// Mock de la API
jest.mock('../app/api/api');

// Mock de la navegación
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('<ServicesScreen />', () => {

  it('renderiza una lista de servicios obtenidos de la API', async () => {
    const mockServices = [
      { id: 1, name: 'Impresión a Color', description: 'Impresión de alta calidad a color.' },
      { id: 2, name: 'Sala de Reuniones', description: 'Reserva por horas.' },
    ];
    
    // Configura el mock para que devuelva los servicios
    API.get.mockResolvedValue({ data: mockServices });

    const { getByText } = render(<ServicesScreen />);

    // Espera a que los datos se carguen y se rendericen
    await waitFor(() => {
      expect(getByText('Impresión a Color')).toBeTruthy();
      expect(getByText('Sala de Reuniones')).toBeTruthy();
    });
  });

});