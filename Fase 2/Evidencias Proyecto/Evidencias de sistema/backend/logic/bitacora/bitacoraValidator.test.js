const { json } = require('express');
const { validateBitacora } = require('./bitacoraValidator');

describe('bitacoraValidator', () => {
    let mockRequest;
    let mockResponse;
    let nextFunction;

    beforeEach(() => {
        mockRequest = {
            body: {},
        };

        mockResponse = {
            status: jest.fn(() => mockResponse),
            json: jest.fn(),
        };
        nextFunction = jest.fn();
    });

    it('Deberia llamar a next() si la validacion es exitosa' , () => {
        mockRequest.body = {
            titulo: "Titulo valido",
            descripcion: "Descripcion valida y larga",
        };

        validateBitacora(mockRequest, mockResponse, nextFunction);
        expect(nextFunction).toHaveBeenCalledTimes(1);
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('Deberia retornar 400 si el titulo falta', () => {
        mockRequest.body = {
            descripcion: "Descripcion valida",
        };

        validateBitacora(mockRequest, mockResponse, nextFunction);
        expect(nextFunction).not.toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            errors: 'El título es obligatorio',
        });
    });

    it('Deberia retornar 400 si la descripcion es muy corta', () => {
        mockRequest.body = {
            titulo: "Titulo valido",
            descripcion: "Foo", //se pide 5 caracteres min
        };

        validateBitacora(mockRequest, mockResponse ,nextFunction);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            errors: 'La descripción debe tener al menos 5 caracteres',
        });
    });
});