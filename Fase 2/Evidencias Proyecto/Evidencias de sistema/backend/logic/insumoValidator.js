function validateInsumo(body) {
  const errors = [];
  const { nombre, stock, stock_minimo } = body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    errors.push('El nombre es obligatorio y debe ser un texto');
  }

  if (stock === undefined || String(stock).trim() === '') {
    errors.push('El stock es obligatorio');
  } else {
    const stockParsed = parseInt(stock, 10);

    if (isNaN(stockParsed)) {
      errors.push('El stock debe ser numerico');
    } else if (stockParsed < 0) {
      errors.push('El stock no puede ser negativo');
    }
  }

  if (stock_minimo === undefined || String(stock_minimo).trim() === '') {

    errors.push('El stock mínimo es obligatorio'); 
  } else {

    const stockMinimoParsed = parseInt(stock_minimo, 10);

    if (isNaN(stockMinimoParsed)) {
      errors.push('El stock debe ser numerico');
    } else if (stockMinimoParsed < 0) {
      errors.push('El stock mínimo no puede ser negativo');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
} 

module.exports = {
  validateInsumo,
};