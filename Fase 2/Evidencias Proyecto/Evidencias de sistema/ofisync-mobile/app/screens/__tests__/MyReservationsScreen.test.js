import React from 'react';
import { render, fireEvent, waitFor, findAllByText } from '@testing-library/react-native';
import { Alert } from 'react-native';
import MyReservationsScreen from '../MyReservationsScreen';
import API from '../../api/api';
import { getUsuario } from '../../../services/usuarioService';

// Mocks
jest.mock('../../api/api');
jest.mock('../../../services/usuarioService');

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return {
    MaterialIcons: (props) => <mock-MaterialIcons {...props} />,
  };
});

const mockReservations = [
  { id: 1, service_name: 'Sala de Reunión', status: 'pendiente', date: '2025-11-01T00:00:00.000Z', start_time: '10:00:00', end_time: '11:00:00' },
  { id: 2, service_name: 'Impresión B/N', status: 'completada', quantity: 10, valor_total: 1000 },
  { id: 3, service_name: 'Sala de Reunión', status: 'cancelada', date: '2025-10-30T00:00:00.000Z', start_time: '12:00:00', end_time: '13:00:00' },
];

describe('MyReservationsScreen', () => {

  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    getUsuario.mockResolvedValue({ id: 5 });
    API.put.mockResolvedValue({});
    API.get.mockResolvedValue({ data: mockReservations });
    
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('llama a la API para completar reservas pasadas y luego lista las reservas del usuario', async () => {
    const { findAllByText } = render(<MyReservationsScreen />);
    
    const items = await findAllByText('Sala de Reunión');
    expect(items.length).toBeGreaterThan(0);
    // Verifica que se llamó a la API para completar reservas pasadas
    expect(API.put).toHaveBeenCalledWith('/reservations/complete-past');
    // Verifica que se llamó a get con el ID de usuario
    expect(API.get).toHaveBeenCalledWith('/reservations/user/5');
  });

  it('renderiza la lista de reservas con sus estados', async () => {
    const { findAllByText, findByText } = render(<MyReservationsScreen />);
    
    expect((await findAllByText('Sala de Reunión')).length).toBe(2);
    expect(await findByText('Impresión B/N')).toBeTruthy();
    
    // Verifica estados
    expect(await findByText('pendiente')).toBeTruthy();
    expect(await findByText('completada')).toBeTruthy();
    expect(await findByText('cancelada')).toBeTruthy();
  });

  it('muestra el botón de cancelar solo para reservas pendientes', async () => {
    const { findAllByText, queryAllByText } = render(<MyReservationsScreen />);
    
    // Espera a que se rendericen los 3 items
    await findAllByText('Fecha:', { exact: false });

    // Debe haber solo 1 botón "Cancelar"
    expect(queryAllByText('Cancelar')).toHaveLength(1);
  });

  it('permite cancelar una reserva pendiente', async () => {
    const { findByText } = render(<MyReservationsScreen />);
    
    const cancelButton = await findByText('Cancelar');
    fireEvent.press(cancelButton);

    // Verifica que se llamó a la API de cancelación
    await waitFor(() => {
      // El ID de la reserva pendiente es 1
      expect(API.put).toHaveBeenCalledWith('/reservations/1/cancel');
    });

    expect(Alert.alert).toHaveBeenCalledWith('Éxito', 'Reserva cancelada');
    
    // Verifica que se recargan las reservas (la 2da llamada a PUT es la de cancelar, la 2da a GET es la de recarga)
    expect(API.get).toHaveBeenCalledTimes(2);
  });

  it('muestra una alerta si falla la cancelación', async () => {
    API.put.mockImplementation((url) => {
      if (url.includes('cancel')) {
        return Promise.reject({ response: { data: { error: 'No se pudo cancelar' } } });
      }
      return Promise.resolve({});
    });

    const { findByText } = render(<MyReservationsScreen />);
    
    fireEvent.press(await findByText('Cancelar'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'No se pudo cancelar');
    });
    
    // No debe recargar las reservas si falla
    expect(API.get).toHaveBeenCalledTimes(1);
  });
  
  it('muestra mensaje de error si falla la carga', async () => {
    getUsuario.mockRejectedValue(new Error('Sin usuario'));
    API.get.mockRejectedValue(new Error('Fallo de red'));
    
    const { findByText } = render(<MyReservationsScreen />);
    
    // El componente debe mostrar el error
    expect(await findByText('Sin usuario')).toBeTruthy();
  });

});