const Joi = require('joi');

const bitacoraSchema = Joi.object({
    titulo: Joi.string().trim().min(3).required().messages({
        'string.empty': 'El título es obligatorio',
        'string.min': 'El título debe tener al menos 3 caracteres',
    }),
    descripcion: Joi.string().trim().min(5).required().messages({
    'string.empty': 'La descripción es obligatoria',
    'string.min': 'La descripción debe tener al menos 5 caracteres',
  }),
  tipo:Joi.string().trim().optional().default('General'),
});

const validateBitacora = (req, res, next) => {
  const { error } = bitacoraSchema.validate(req.body);
  
  if (error) {
    // Si hay un error de validación, respondemos 400
    return res.status(400).json({ errors: error.details[0].message });
  }
  // Si todo está bien, pasamos al siguiente paso (el controlador)
  next();
};

module.exports = {
    validateBitacora
};