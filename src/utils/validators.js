const Joi = require('joi');

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false, stripUnknown: true, convert: true,
  });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message.replace(/"/g, '') })),
    });
  }
  req[source] = value;
  next();
};

const schemas = {
  register: Joi.object({
    name:     Joi.string().trim().min(2).max(100).required(),
    email:    Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).max(72)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .message('Password needs uppercase, lowercase, number, and special character')
      .required(),
    role: Joi.string().valid('viewer','analyst','admin').default('viewer'),
  }),

  login: Joi.object({
    email:    Joi.string().email().lowercase().required(),
    password: Joi.string().required(),
  }),

  updateRole:   Joi.object({ role:   Joi.string().valid('viewer','analyst','admin').required() }),
  updateStatus: Joi.object({ status: Joi.string().valid('active','inactive').required() }),
  updateProfile: Joi.object({ name:  Joi.string().trim().min(2).max(100).required() }),

  createRecord: Joi.object({
    amount:   Joi.number().positive().precision(2).required(),
    type:     Joi.string().valid('income','expense').required(),
    category: Joi.string().trim().min(1).max(100).required(),
    date:     Joi.date().iso().max('now').required(),
    notes:    Joi.string().trim().max(500).allow('',null).optional(),
  }),

  updateRecord: Joi.object({
    amount:   Joi.number().positive().precision(2),
    type:     Joi.string().valid('income','expense'),
    category: Joi.string().trim().min(1).max(100),
    date:     Joi.date().iso().max('now'),
    notes:    Joi.string().trim().max(500).allow('',null),
  }).min(1),

  listRecords: Joi.object({
    page:       Joi.number().integer().min(1).default(1),
    limit:      Joi.number().integer().min(1).max(100).default(20),
    type:       Joi.string().valid('income','expense'),
    category:   Joi.string().trim().max(100),
    start_date: Joi.date().iso(),
    end_date:   Joi.date().iso(),
    sort_by:    Joi.string().valid('date','amount','created_at').default('date'),
    sort_order: Joi.string().valid('asc','desc').default('desc'),
    search:     Joi.string().trim().max(100),
  }),
};

module.exports = { validate, schemas };