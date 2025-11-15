const Joi = require('joi');

const insumoSchema = Joi.object({
  nombre: Joi.string().trim().min(3).required().messages({
    'string.base': 'El nombre debe ser un texto.',
    'string.empty': 'El nombre es obligatorio.',
    'string.min': 'El nombre debe tener al menos 3 caracteres.',
    'any.required': 'El nombre es obligatorio.',
  }),
  categoria: Joi.string().trim().required().messages({
    'string.base': 'La categoría debe ser un texto.',
    'string.empty': 'La categoría es obligatoria.',
    'any.required': 'La categoría es obligatoria.',
  }),
  stock: Joi.number().integer().min(0).required().messages({
    'number.base': 'El stock debe ser un número.',
    'number.integer': 'El stock debe ser un número entero.',
    'number.min': 'El stock no puede ser negativo.', 
    'any.required': 'El stock es obligatorio.',
  }),
  stock_minimo: Joi.number().integer().min(0).required().messages({
    'number.base': 'El stock mínimo debe ser un número.',
    'number.integer': 'El stock mínimo debe ser un número entero.',
    'number.min': 'El stock mínimo no puede ser negativo.', 
    'any.required': 'El stock mínimo es obligatorio.',
  }),
});

const validateInsumo = (req, res, next) => {
  const { error } = insumoSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message).join(', ');
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = { validateInsumo };