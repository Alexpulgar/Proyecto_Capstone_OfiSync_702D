import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import GastosComunesScreen from '../GastosComunesScreen';
import API from '../../api/api';
import { getUsuario } from '../../../services/usuarioService';
import * as DocumentPicker from 'expo-document-picker';

// Mocks
jest.mock('../../api/api');
jest.mock('../../../services/usuarioService');

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
    API.get.mockImplementationOnce(() => new Promise(() => {})); // Mantiene la promesa pendiente
    const { getByText } = render(<GastosComunesScreen />);
    expect(getByText('Cargando gastos...')).toBeTruthy();
  });

  it('muestra un error si falla la carga de gastos', async () => {
    API.get.mockRejectedValue({ response: { data: { error: 'Error de red' } } });
    const { findByText } = render(<GastosComunesScreen />);
    expect(await findByText('Error de red')).toBeTruthy();
  });

  it('muestra un error si el usuario no tiene oficina', async () => {
    getUsuario.mockResolvedValue({ id: 1, oficina_id: null });
    const { findByText } = render(<GastosComunesScreen />);
    expect(await findByText('Este usuario no está asociado a ninguna oficina.')).toBeTruthy();
  });

  it('muestra mensaje si no hay gastos', async () => {
    API.get.mockResolvedValue({ data: [] });
    const { findByText } = render(<GastosComunesScreen />);
    expect(await findByText('No se encontraron gastos para tu oficina.')).toBeTruthy();
  });

  it('renderiza la deuda total y los meses pendientes correctamente', async () => {
    const { findByText } = render(<GastosComunesScreen />);
    
    // Deuda total (pendiente + en revision)
    expect(await findByText('$150.000')).toBeTruthy(); 
    
    // Mes pendiente
    expect(await findByText('Octubre de 2023')).toBeTruthy();
    expect(await findByText('$100.000')).toBeTruthy();
    
    // Mes en revisión
    expect(await findByText('Septiembre de 2023')).toBeTruthy();
    expect(await findByText('$50.000')).toBeTruthy();
    expect(await findByText('En Revisión')).toBeTruthy();
    
    // El mes pagado no debe estar en la lista de pendientes
    expect(findByText('Agosto de 2023')).toBeNull();
  });

  it('muestra "¡Estás al día!" si la deuda es 0', async () => {
    API.get.mockResolvedValue({ data: [mockGastos[2]] }); // Solo el pagado
    const { findByText, queryByText } = render(<GastosComunesScreen />);
    
    expect(await findByText('$0')).toBeTruthy();
    expect(await findByText('¡Estás al día!')).toBeTruthy();
    expect(queryByText('Subir Comprobante')).toBeNull();
  });

  it('permite subir un comprobante', async () => {
    DocumentPicker.getDocumentAsync.mockResolvedValue({ 
      canceled: false, 
      assets: [{ uri: 'file://doc.pdf', name: 'comprobante.pdf', mimeType: 'application/pdf' }] 
    });
    API.post.mockResolvedValue({ data: { msg: 'Comprobante subido' } });
    
    const { findByText } = render(<GastosComunesScreen />);
    
    const uploadButton = await findByText('Subir Comprobante');
    fireEvent.press(uploadButton);
    
    await waitFor(() => {
      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
    });
    
    // Verifica que el POST se hizo (FormData es difícil de mockear, pero podemos chequear la llamada)
    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith(
        '/gasto-comun/subir-comprobante',
        expect.any(FormData), // Verifica que es FormData
        expect.any(Object)   // Verifica las cabeceras
      );
    });

    // Verifica que se pasa el ID correcto (solo el 'pendiente', no el 'en revision')
    const formData = API.post.mock.calls[0][1];
    expect(formData.get('gastos_ids')).toBe(JSON.stringify([1])); // detalle_id 1
    
    expect(Alert.alert).toHaveBeenCalledWith('Éxito', 'Comprobante subido');
    // Verifica que se recargan los gastos
    expect(API.get).toHaveBeenCalledTimes(2); 
  });

  it('muestra alerta si solo hay gastos "en revisión" al intentar pagar', async () => {
    API.get.mockResolvedValue({ data: [mockGastos[1]] }); // Solo el 'en revision'
    const { findByText } = render(<GastosComunesScreen />);

    // El botón de subir no debería aparecer
    // Ah, pero la deuda total es > 0, así que el botón aparece.
    // La validación está *dentro* de handleUploadProof
    
    const uploadButton = await findByText('Subir Comprobante');
    fireEvent.press(uploadButton);
    
    expect(Alert.alert).toHaveBeenCalledWith('Revisión Pendiente', 'No tienes gastos pendientes de pago. Tus comprobantes están en revisión.');
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