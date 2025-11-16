import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Administracion from "../Administracion";
import * as oficinasService from "../../../../services/oficinasService";

jest.mock("../../../../services/oficinasService");

describe("Prueba de Integración para el componente Administracion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("debería cargar y mostrar la lista inicial de oficinas al renderizar", async () => {
    const oficinasMock = [
      {
        edificio: "Torre A",
        numero_piso: 1,
        oficina: "101",
        area: 50,
        estado: "libre",
        arrendatario: null,
      },
    ];

    oficinasService.getOficinas.mockResolvedValue(oficinasMock);

    render(
      <MemoryRouter>
        <Administracion />
      </MemoryRouter>
    );

    expect(await screen.findByText("Torre A")).toBeInTheDocument();
    expect(screen.getByText("101")).toBeInTheDocument();
  });

  test("debería llamar al servicio de búsqueda y mostrar los resultados filtrados", async () => {
    const oficinasFiltradasMock = [
      {
        edificio: "Torre B",
        numero_piso: 5,
        oficina: "505",
        area: 120,
        estado: "ocupada",
        arrendatario: "Ana",
      },
    ];

    oficinasService.getOficinas.mockResolvedValue([]);
    oficinasService.buscarOficinas.mockResolvedValue(oficinasFiltradasMock);

    render(
      <MemoryRouter>
        <Administracion />
      </MemoryRouter>
    );

    const inputArrendatario = screen.getByPlaceholderText("Nombre");
    fireEvent.change(inputArrendatario, { target: { value: "Ana" } });

    const botonBuscar = screen.getByRole("button", { name: /buscar/i });
    fireEvent.click(botonBuscar);

    await waitFor(() => {
      expect(oficinasService.buscarOficinas).toHaveBeenCalledWith({
        codigo: "",
        piso: "",
        estado: "",
        arrendatario: "Ana",
      });
    });

    const resultados = await screen.findAllByText("Torre B");
    expect(resultados.length).toBeGreaterThan(0);
    expect(screen.getByText("505")).toBeInTheDocument();
  });
});
