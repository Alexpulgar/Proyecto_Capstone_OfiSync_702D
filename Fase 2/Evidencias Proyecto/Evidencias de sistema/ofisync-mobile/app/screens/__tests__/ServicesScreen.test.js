import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ServicesScreen from '../ServicesScreen';
import API from '../../api/api';

// Mocks
jest.mock('../../api/api');
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

const mockServices = [
  { id: 1, name: 'Servicio A', description: 'Desc A' },
  { id: 2, name: 'Servicio B', description: 'Desc B' },
];

describe('ServicesScreen', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    API.get.mockResolvedValue({ data: mockServices });
  });

  it('carga y muestra la lista de servicios', async () => {
    const { findByText } = render(<ServicesScreen />);
    
    expect(await findByText('Servicio A')).toBeTruthy();
    expect(await findByText('Desc A')).toBeTruthy();
    expect(await findByText('Servicio B')).toBeTruthy();
    expect(await findByText('Desc B')).toBeTruthy();
    
    expect(API.get).toHaveBeenCalledWith('/reservations/services');
  });

  it('navega a la pantalla de Reserva al presionar un servicio', async () => {
    const { findByText } = render(<ServicesScreen />);
    
    const serviceA = await findByText('Servicio A');
    fireEvent.press(serviceA);
    
    expect(mockNavigate).toHaveBeenCalledWith('Reserva', { service: mockServices[0] });
  });

  it('no crashea si la API falla (aunque no maneja el error visualmente)', async () => {
    API.get.mockRejectedValue(new Error('API Error'));
    const { queryByText } = render(<ServicesScreen />);
    
    // Espera un momento para asegurar que la promesa se rechazó
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(queryByText('Servicio A')).toBeNull();
  });
});