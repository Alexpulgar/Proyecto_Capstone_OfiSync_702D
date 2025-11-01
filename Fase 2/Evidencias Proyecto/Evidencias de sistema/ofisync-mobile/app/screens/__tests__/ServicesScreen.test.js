import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'; 
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
    jest.useFakeTimers(); 
    jest.clearAllMocks();
    API.get.mockResolvedValue({ data: mockServices });
  });

  afterEach(() => {
    jest.useRealTimers(); 
  });

  it('carga y muestra la lista de servicios', async () => {
    const { getByText } = render(<ServicesScreen />);
    
    await waitFor(() => {
      expect(getByText('Servicio A')).toBeTruthy();
      expect(getByText('Desc A')).toBeTruthy();
      expect(getByText('Servicio B')).toBeTruthy();
      expect(getByText('Desc B')).toBeTruthy();
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });
    
    expect(API.get).toHaveBeenCalledWith('/reservations/services');
  });

  it('navega a la pantalla de Reserva al presionar un servicio', async () => {
    const { findByText } = render(<ServicesScreen />);
    
    const serviceA = await findByText('Servicio A');
    
    act(() => {
      jest.runOnlyPendingTimers();
    });

    fireEvent.press(serviceA);
    
    expect(mockNavigate).toHaveBeenCalledWith('Reserva', { service: mockServices[0] });
  });

  it('no crashea si la API falla', async () => {
    API.get.mockRejectedValue(new Error('API Error'));
    const { queryByText } = render(<ServicesScreen />);
    
    await waitFor(() => {
      expect(queryByText('Servicio A')).toBeNull();
    });
    
    act(() => {
      jest.runOnlyPendingTimers();
    });
  });
});