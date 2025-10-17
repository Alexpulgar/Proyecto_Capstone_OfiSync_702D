import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ReserveServiceScreen from '../app/screens/ReserveServiceScreen';
import * as DocumentPicker from 'expo-document-picker';
import API from '../app/api/api';

jest.spyOn(Alert, 'alert');
jest.mock('../app/api/api');
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));
// Mock para el DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => <View testID="mock-date-time-picker" {...props} />;
});
// Mock para navegación
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: mockGoBack,
    }),
}));

const mockGoBack = jest.fn();
const mockNavigation = { goBack: mockGoBack };
const mockRoutePrint = { params: { service: { id: 1, name: 'Impresión', type: 'print' } } };
const mockRouteRoom = { params: { service: { id: 2, name: 'Sala de Reuniones', type: 'room' } } };

describe('<ReserveServiceScreen />', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) }));
    global.alert = jest.fn();
    API.get.mockResolvedValue({ data: [] }); 
  });
  
  // Pruebas para Impresión
  it('debería crear una reserva de impresión correctamente', async () => {
    DocumentPicker.getDocumentAsync.mockResolvedValue({ canceled: false, assets: [{ name: 'test.pdf', mimeType: 'application/pdf' }] });
    const { getByText, getByPlaceholderText, getByTestId } = render(<ReserveServiceScreen route={mockRoutePrint} navigation={mockNavigation} />);
    
    fireEvent.changeText(getByPlaceholderText('Ingrese la cantidad'), '10');
    fireEvent(getByTestId('size-picker'), 'onValueChange', 'Carta');
    await act(async () => { fireEvent.press(getByText(/Adjuntar archivo/)); });
    await waitFor(() => expect(getByText('Archivo: test.pdf')).toBeTruthy());
    
    await act(async () => { fireEvent.press(getByText('Reservar')); });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith("Reserva creada con éxito");
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  // Pruebas para Sala de Reuniones
  describe('Sala de Reuniones', () => {
    it('debería mostrar alerta si la hora de fin no es posterior a la de inicio', async () => {
      const { getByText, findByTestId } = render(<ReserveServiceScreen route={mockRouteRoom} navigation={mockNavigation} />);
      
      fireEvent.press(getByText(new Date().toISOString().split('T')[0]));
      
      const datePicker = await findByTestId('mock-date-time-picker');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      fireEvent(datePicker, 'onChange', null, tomorrow);
      
      fireEvent.press(getByText('Reservar'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("La hora de término debe ser posterior a la hora de inicio.");
      });
    });

    it('debería mostrar alerta si el horario ya pasó', async () => {
      const { getByText, findByTestId } = render(<ReserveServiceScreen route={mockRouteRoom} navigation={mockNavigation} />);

      fireEvent.press(getByText(new Date().toISOString().split('T')[0]));
      
      const datePicker = await findByTestId('mock-date-time-picker');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      fireEvent(datePicker, 'onChange', null, yesterday);
      
      fireEvent.press(getByText('Reservar'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("No puedes reservar un horario que ya pasó.");
      });
    });
  });
});