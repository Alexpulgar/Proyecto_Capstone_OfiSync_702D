function validateBitacora (body) {
    const errors = [];
    const {titulo, descripcion } = body;

    if (!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
        errors.push("El titulo es obligatorio");
    }

    if (!descripcion || typeof descripcion !== 'string' || descripcion.trim() === '') {
        errors.push("La descripcion es obligatoria");
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
    };
}

module.exports = {
    validateBitacora,
}