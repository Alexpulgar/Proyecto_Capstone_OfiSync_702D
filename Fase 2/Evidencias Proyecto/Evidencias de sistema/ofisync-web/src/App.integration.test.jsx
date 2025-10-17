import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mockeamos todos los servicios que las páginas puedan necesitar
jest.mock('../services/oficinasService', () => ({
  getOficinas: jest.fn().mockResolvedValue([]),
  buscarOficinas: jest.fn().mockResolvedValue([]),
}));
jest.mock('../services/edificioService', () => ({
  getEdificios: jest.fn().mockResolvedValue([]),
}));
jest.mock('../services/gastoComunService');

// Mockeamos la librería de gráficos
jest.mock('react-chartjs-2', () => ({
  Pie: () => null,
  Bar: () => null,
}));

describe('Prueba de Integración de Navegación en App', () => {

  test('debería navegar a la página de Gasto Común al hacer clic en el enlace', async () => {
    render(<App />);
    
    // Buscamos el enlace por su texto exacto
    const enlaceGastoComun = screen.getByRole('link', { name: /Gasto Común/i });
    fireEvent.click(enlaceGastoComun);
    
    expect(await screen.findByRole('heading', { name: /calcular gasto común/i })).toBeInTheDocument();
  });

  test('debería navegar a la página de Administración al hacer clic en el enlace', async () => {
    render(<App />);
    
    // Buscamos el enlace por su texto exacto
    const enlaceAdmin = screen.getByRole('link', { name: /Administración/i });
    fireEvent.click(enlaceAdmin);

    expect(await screen.findByRole('heading', { name: /buscar oficina/i })).toBeInTheDocument();
  });
});