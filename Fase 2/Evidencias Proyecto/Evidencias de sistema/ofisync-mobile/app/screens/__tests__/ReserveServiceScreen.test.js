import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ReserveServiceScreen from '../ReserveServiceScreen';
import API from '../../api/api';
import { getUsuario } from '../../../services/usuarioService';
import * as DocumentPicker from 'expo-document-picker';

// Mocks de APIs
jest.mock('../../api/api');
jest.mock('../../../services/usuarioService');
jest.mock('expo-document-picker'); 
global.fetch = jest.fn(); 

// Mock del Picker
jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const MockPicker = (props) => {
    return (
      <mock-Picker {...props}> 
        {props.children} 
      </mock-Picker>
    );
  };
  const MockItem = (props) => {
    return null; 
  };
  MockPicker.Item = MockItem;
  return { Picker: MockPicker };
});

// Mocks para las Props
const mockNavigateGoBack = jest.fn();
const mockNavigation = { goBack: mockNavigateGoBack };

const mockUserService = { id: 1 };
const mockServiceRoom = { id: 10, name: 'Sala VIP', type: 'room' };
const mockServicePrint = { id: 20, name: 'Impresión Color', type: 'print' };

const mockRoutePrint = { params: { service: mockServicePrint } };
const mockRouteRoom = { params: { service: mockServiceRoom } };


describe('ReserveServiceScreen', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    getUsuario.mockResolvedValue(mockUserService);
    API.get.mockResolvedValue({ data: [] }); 
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ msg: 'Éxito' }) });
    
    DocumentPicker.getDocumentAsync.mockResolvedValue({ 
      canceled: false, 
      assets: [{ uri: 'file://doc.pdf', name: 'doc.pdf', mimeType: 'application/pdf' }] 
    });
  });

  describe('Servicio de Impresión (no-room)', () => {
    
    it('renderiza campos de cantidad, tamaño y archivo', () => {
      const { getByText, getByPlaceholderText, getByTestId } = render(
        <ReserveServiceScreen navigation={mockNavigation} route={mockRoutePrint} />
      );
      
      expect(getByText(mockServicePrint.name)).toBeTruthy();
      expect(getByPlaceholderText('Ingrese la cantidad')).toBeTruthy();
      expect(getByTestId('size-picker')).toBeTruthy(); 
      expect(getByText(/Adjuntar archivo/)).toBeTruthy();
    });

    it('valida que la cantidad sea un número positivo', async () => {
      const { getByText, getByPlaceholderText } = render(
        <ReserveServiceScreen navigation={mockNavigation} route={mockRoutePrint} />
      );
      
      fireEvent.changeText(getByPlaceholderText('Ingrese la cantidad'), '0');
      fireEvent.press(getByText('Reservar'));
      
      // Espera a que la alerta sea llamada
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(expect.stringContaining('cantidad válida'));
      });
    });

    it('valida que la cantidad no supere 1000', async () => {
      const { getByText, getByPlaceholderText } = render(
        <ReserveServiceScreen navigation={mockNavigation} route={mockRoutePrint} />
      );
      
      fireEvent.changeText(getByPlaceholderText('Ingrese la cantidad'), '1001');
      fireEvent.press(getByText('Reservar'));
      
      // Espera a que la alerta sea llamada
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'La cantidad no puede ser mayor a 1000.');
      });
    });

    it('valida que se seleccione un tamaño', async () => {
      const { getByText, getByPlaceholderText } = render(
        <ReserveServiceScreen navigation={mockNavigation} route={mockRoutePrint} />
      );
      
      fireEvent.changeText(getByPlaceholderText('Ingrese la cantidad'), '10');
      fireEvent.press(getByText('Reservar'));
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(expect.stringContaining('tamaño de hoja'));
      });
    });

    it('valida que se adjunte un archivo', async () => {
      const { getByText, getByPlaceholderText, getByTestId } = render(
        <ReserveServiceScreen navigation={mockNavigation} route={mockRoutePrint} />
      );
      
      fireEvent.changeText(getByPlaceholderText('Ingrese la cantidad'), '10');
      fireEvent(getByTestId('size-picker'), 'onValueChange', 'A4');
      
      fireEvent.press(getByText('Reservar'));
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(expect.stringContaining('adjuntar un archivo'));
      });
    });

    it('crea la reserva de impresión exitosamente', async () => {
      const { getByText, getByPlaceholderText, getByTestId } = render(
        <ReserveServiceScreen navigation={mockNavigation} route={mockRoutePrint} />
      );
      
      fireEvent.changeText(getByPlaceholderText('Ingrese la cantidad'), '50');
      fireEvent(getByTestId('size-picker'), 'onValueChange', 'A4');
      fireEvent.press(getByText(/Adjuntar archivo/));
      
      await waitFor(() => {
        expect(getByText(/Archivo: doc.pdf/)).toBeTruthy();
      });

      fireEvent.press(getByText('Reservar'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      await waitFor(() => {
          expect(Alert.alert).toHaveBeenCalledWith('Éxito', expect.any(String));
      });
      expect(mockNavigateGoBack).toHaveBeenCalled();
    });
  });

  describe('Servicio de Sala (room)', () => {
    
    it('renderiza campos de fecha y hora', async () => {
      const { getByText } = render(
        <ReserveServiceScreen navigation={mockNavigation} route={mockRouteRoom} />
      );
      
      await waitFor(() => {
         expect(API.get).toHaveBeenCalled();
      });

      expect(getByText(mockServiceRoom.name)).toBeTruthy();
      expect(getByText('Fecha:')).toBeTruthy();
      expect(getByText('Hora inicio:')).toBeTruthy();
      expect(getByText('Hora término:')).toBeTruthy();
    });

    it('busca horarios ocupados al cargar', async () => {
      render(
        <ReserveServiceScreen navigation={mockNavigation} route={mockRouteRoom} />
      );
      
      await waitFor(() => {
        expect(API.get).toHaveBeenCalledWith(expect.stringContaining('/reservations/room/10/'));
      });
    });
    
  });
});