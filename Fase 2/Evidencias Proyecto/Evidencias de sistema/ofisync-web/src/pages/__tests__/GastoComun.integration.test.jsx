import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GastoComun from '../GastoComun';
import * as gastoComunService from '../../../services/gastoComunService';
import * as edificioService from '../../../services/edificioService';

// Mockeamos los servicios
jest.mock('../../../services/gastoComunService');
jest.mock('../../../services/edificioService');

describe('Prueba de Integración para GastoComun', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  test('debería llamar a la API de cálculo al llenar y enviar el formulario', async () => {
    const edificiosMock = [{ id: 1, nombre: 'Edificio Central' }];
    const respuestaApiMock = { mensaje: 'Gasto calculado', gasto_por_m2: '500.00' };

    edificioService.getEdificios.mockResolvedValue(edificiosMock);
    gastoComunService.calcularGastoComunApi.mockResolvedValue(respuestaApiMock);

    render(
      <MemoryRouter>
        <GastoComun />
      </MemoryRouter>
    );

    await screen.findByText('Edificio Central');

    // Simular el llenado de los campos individuales de gastos
    fireEvent.change(screen.getByLabelText('Edificio:'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Mes:'), { target: { value: '2025-12' } });
    fireEvent.change(screen.getByLabelText('Gasto Luz ($):'), { target: { value: '100000' } });
    fireEvent.change(screen.getByLabelText('Gasto Agua ($):'), { target: { value: '150000' } });
    
    fireEvent.click(screen.getByRole('button', { name: /calcular gasto/i }));

    await waitFor(() => {
      expect(gastoComunService.calcularGastoComunApi).toHaveBeenCalledWith({
        edificio_id: 1,
        mes: 'diciembre de 2025', // El componente formatea el mes
        total: 250000, // La suma de luz y agua
        luz: 100000,
        agua: 150000,
        mantencion: 0,
        otros: 0,
        descripcion: '',
      });
    });
  });
});