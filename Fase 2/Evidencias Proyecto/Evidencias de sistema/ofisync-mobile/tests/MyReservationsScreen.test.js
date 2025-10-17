import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import MyReservationsScreen from '../app/screens/MyReservationsScreen';
import API from '../app/api/api';

// Mock de la API
jest.mock('../app/api/api');

jest.spyOn(Alert, 'alert');

// Mock de useFocusEffect para que se ejecute una sola vez
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useFocusEffect: (callback) => callback(),
}));

describe('<MyReservationsScreen />', () => {

  beforeEach(() => {
    // Limpiamos los mocks después de cada prueba
    jest.clearAllMocks();
  });

  it('debería renderizar las reservas del usuario', async () => {
    const mockReservations = [
      { id: 1, service_name: 'Sala de Reuniones', status: 'pendiente', valor_total: 10000 },
      { id: 2, service_name: 'Impresión a Color', status: 'completada', valor_total: 500 },
    ];
    
    API.put.mockResolvedValue({}); // Mock para complete-past
    API.get.mockResolvedValue({ data: mockReservations });

    const { getByText } = render(<MyReservationsScreen />);

    await waitFor(() => {
      expect(getByText('Sala de Reuniones')).toBeTruthy();
      expect(getByText('Impresión a Color')).toBeTruthy();
    });
  });

  it('debería llamar a la API de cancelación cuando se presiona el botón "Cancelar"', async () => {
    const mockReservations = [
      { id: 1, service_name: 'Sala de Reuniones', status: 'pendiente' },
    ];
    
    API.put.mockResolvedValue({});
    API.get.mockResolvedValue({ data: mockReservations });
  
    const { getByText } = render(<MyReservationsScreen />);
    
    const cancelButton = await waitFor(() => getByText('Cancelar'));
    
    fireEvent.press(cancelButton);
    
    await waitFor(() => {
      expect(API.put).toHaveBeenCalledWith('/reservations/1/cancel');
      expect(Alert.alert).toHaveBeenCalledWith("Reserva cancelada");
    });
  });
});