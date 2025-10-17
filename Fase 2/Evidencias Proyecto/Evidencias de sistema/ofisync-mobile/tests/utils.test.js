const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
};

const formatCurrency = (value) => {
  return value?.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  });
};


describe('Funciones de Utilidad', () => {
  // Pruebas para formatDate
  describe('formatDate', () => {
    it('debería formatear una fecha ISO a DD-MM-YYYY', () => {
      const dateStr = '2025-10-14T00:00:00.000Z';
      expect(formatDate(dateStr)).toBe('14-10-2025');
    });
  });

  // Pruebas para formatCurrency
  describe('formatCurrency', () => {
    it('debería formatear un número a moneda chilena (CLP)', () => {
      expect(formatCurrency(10000)).toBe('$10.000');
    });

    it('debería devolver undefined si el valor es nulo o undefined', () => {
      expect(formatCurrency(null)).toBeUndefined();
      expect(formatCurrency(undefined)).toBeUndefined();
    });
  });
});