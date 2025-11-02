import React from 'react';
import { render, fireEvent, waitFor, act, queryByText } from '@testing-library/react-native';
import { Alert } from 'react-native';
import GastosComunesScreen from '../GastosComunesScreen';
import API from '../../api/api';
import { getUsuario } from '../../../services/usuarioService';
import * as DocumentPicker from 'expo-document-picker';

// Mocks
jest.mock('../../api/api');
jest.mock('../../../services/usuarioService');
jest.mock('expo-document-picker'); 

// Mock para Ionicons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return {
    Ionicons: (props) => <mock-Ionicons {...props} />,
  };
});


const mockGastos = [
  { detalle_id: 1, monto: 100000, estado_pago: 'pendiente', anio: 2023, mes_numero: 10 }, 
  { detalle_id: 2, monto: 50000, estado_pago: 'en revision', anio: 2023, mes_numero: 9 }, 
  { detalle_id: 3, monto: 110000, estado_pago: 'pagado', anio: 2023, mes_numero: 8 }, 
];

describe('GastosComunesScreen', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    getUsuario.mockResolvedValue({ id: 1, oficina_id: 10 });
    API.get.mockResolvedValue({ data: mockGastos });
  });

  it('muestra el estado de carga inicialmente', () => {
    API.get.mockImplementationOnce(() => new Promise(() => {})); 
    const { getByText } = render(<GastosComunesScreen />);
    expect(getByText('Cargando gastos...')).toBeTruthy(); 
  });

  it('renderiza la deuda total y los meses pendientes correctamente', async () => {
    const { findByText, getByText, queryByText } = render(<GastosComunesScreen />);
    
    expect(await findByText('Total a Pagar')).toBeTruthy();
    expect(getByText('$150.000')).toBeTruthy(); 
    expect(getByText('Octubre de 2023')).toBeTruthy();
    expect(getByText('Septiembre de 2023')).toBeTruthy();
    expect(getByText('En Revisión')).toBeTruthy(); 
    expect(queryByText('Agosto de 2023')).toBeNull();
  });

  it('muestra el mensaje correcto si la deuda es 0', async () => {
    API.get.mockResolvedValue({ data: [] });
    const { findByText } = render(<GastosComunesScreen />);
    expect(await findByText('No se encontraron gastos para tu oficina.')).toBeTruthy();
  });

  it('maneja el upload de un comprobante exitosamente', async () => {
    DocumentPicker.getDocumentAsync.mockResolvedValue({ 
      canceled: false, 
      assets: [{ uri: 'file://doc.pdf', name: 'doc.pdf', mimeType: 'application/pdf' }] 
    });
    API.post.mockResolvedValue({ ok: true, data: { message: 'Comprobante subido' } });
    
    const { findByText } = render(<GastosComunesScreen />);
    
    const uploadButton = await findByText('Subir Comprobante');
    fireEvent.press(uploadButton);
    
    await waitFor(() => {
      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith(
        expect.stringContaining('/gasto-comun/subir-comprobante'),
        expect.anything(),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
    });
    
    const formData = API.post.mock.calls[0][1];
    expect(formData.get('gastos_ids')).toBe(JSON.stringify([1])); 
    
    expect(Alert.alert).toHaveBeenCalledWith('Éxito', 'Comprobante subido correctamente.');
    expect(API.get).toHaveBeenCalledTimes(2); 
  });

  it('muestra alerta si solo hay gastos "en revisión" al intentar pagar', async () => {
    API.get.mockResolvedValue({ data: [mockGastos[1]] }); 
    
    const { findByText, queryByText } = render(<GastosComunesScreen />);
    expect(await findByText('Septiembre de 2023')).toBeTruthy();
    
    const uploadButton = queryByText('Subir Comprobante');
    expect(uploadButton).toBeNull();
    
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(DocumentPicker.getDocumentAsync).not.toHaveBeenCalled();
  });

  it('no hace nada si el selector de archivos es cancelado', async () => {
    DocumentPicker.getDocumentAsync.mockResolvedValue({ canceled: true });
    
    const { findByText } = render(<GastosComunesScreen />);
    
    fireEvent.press(await findByText('Subir Comprobante'));
    
    await waitFor(() => {
      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
    });
    
    expect(API.post).not.toHaveBeenCalled();
  });
});