import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // <--- IMPORTACIÓN CLAVE
import Administracion from '../Administracion';
import * as oficinasService from '../../../../services/oficinasService'; // <--- RUTA CORREGIDA

// Mockeamos el módulo completo de 'oficinasService' para controlar las llamadas a la API.
jest.mock('../../../../services/oficinasService'); // <--- RUTA CORREGIDA

describe('Prueba de Integración para el componente Administracion', () => {

  // Antes de cada prueba, reseteamos los mocks
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería cargar y mostrar la lista inicial de oficinas al renderizar', async () => {
    const oficinasMock = [
      { edificio: 'Torre A', numero_piso: 1, oficina: '101', area: 50, estado: 'libre', arrendatario: null },
    ];
    
    // Configuramos el mock para la carga inicial
    oficinasService.getOficinas.mockResolvedValue(oficinasMock);

    // ENVOLVEMOS EL COMPONENTE EN MEMORYROUTER
    render(
      <MemoryRouter>
        <Administracion />
      </MemoryRouter>
    );

    // Esperamos a que el texto 'Torre A' (del mock) aparezca en la pantalla.
    expect(await screen.findByText('Torre A')).toBeInTheDocument();
    expect(screen.getByText('101')).toBeInTheDocument();
  });


  test('debería llamar al servicio de búsqueda y mostrar los resultados filtrados', async () => {
    const oficinasFiltradasMock = [
        { edificio: 'Torre B', numero_piso: 5, oficina: '505', area: 120, estado: 'ocupada', arrendatario: 'Ana' },
    ];

    // Carga inicial
    oficinasService.getOficinas.mockResolvedValue([]);
    // Configuramos el mock para la búsqueda
    oficinasService.buscarOficinas.mockResolvedValue(oficinasFiltradasMock);

    // ENVOLVEMOS EL COMPONENTE EN MEMORYROUTER
    render(
      <MemoryRouter>
        <Administracion />
      </MemoryRouter>
    );

    // 1. Simular que el usuario escribe en el campo de texto "Arrendatario"
    const inputArrendatario = screen.getByPlaceholderText('Nombre');
    fireEvent.change(inputArrendatario, { target: { value: 'Ana' } });

    // 2. Simular que el usuario hace clic en el botón "Buscar"
    const botonBuscar = screen.getByRole('button', { name: /buscar/i });
    fireEvent.click(botonBuscar);

    // 3. Verificar que se llamó al servicio de búsqueda con el filtro correcto
    await waitFor(() => {
        expect(oficinasService.buscarOficinas).toHaveBeenCalledWith({
            codigo: '',
            piso: '',
            estado: '',
            arrendatario: 'Ana',
        });
    });

    // 4. Verificar que los resultados de la búsqueda se muestran en la pantalla.
    const resultados = await screen.findAllByText('Torre B');
    expect(resultados.length).toBeGreaterThan(0);
    expect(screen.getByText('505')).toBeInTheDocument();
  });
});