const Joi = require('joi');
const { BadRequestError } = require('../utils/errors');

const validate = (schema) => (req, res, next) => {
  const { value, error } = schema.validate(
    {
      body: req.body,
      query: req.query,
      params: req.params,
    },
    { abortEarly: false, allowUnknown: true }
  );

  if (error) {
    const errorMessages = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/[\"']/g, ''),
    }));
    return next(new BadRequestError('Validation failed', errorMessages));
  }

  // Replace request properties with validated values
  req.body = value.body || {};
  req.query = value.query || {};
  req.params = value.params || {};

  return next();
};

// Helper schemas
const mongoIdSchema = Joi.string().hex().length(24);

// Task schemas
const taskIdSchema = Joi.object({
  params: Joi.object({
    taskId: mongoIdSchema.required(),
  }).required(),
});

const fileIdSchema = Joi.object({
  params: Joi.object({
    fileId: mongoIdSchema.required(),
  }).required(),
});

const taskQuerySchema = Joi.object({
  query: Joi.object({
    assetId: Joi.string(),
    location: Joi.string(),
    status: Joi.string().valid('pending', 'in-progress', 'on-hold', 'completed', 'cancelled'),
    dueDateFrom: Joi.date().iso(),
    dueDateTo: Joi.date().iso().min(Joi.ref('dueDateFrom')),
    sort: Joi.string().valid('dueDate', '-dueDate', 'createdAt', '-createdAt'),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
});

const taskStatusSchema = Joi.object({
  body: Joi.object({
    status: Joi.string()
      .valid('pending', 'in-progress', 'on-hold', 'completed', 'cancelled')
      .required(),
    notes: Joi.string().allow('').optional(),
  }).required(),
});

const checklistSchema = Joi.object({
  body: Joi.object({
    checklistItems: Joi.array()
      .items(
        Joi.object({
          description: Joi.string().required(),
          completed: Joi.boolean().default(false),
          completedBy: Joi.when('completed', {
            is: true,
            then: Joi.string().required(),
            otherwise: Joi.forbidden(),
          }),
          completedAt: Joi.when('completed', {
            is: true,
            then: Joi.date().default(() => new Date()),
            otherwise: Joi.forbidden(),
          }),
        })
      )
      .required(),
  }).required(),
});

const partsSchema = Joi.object({
  body: Joi.object({
    parts: Joi.array()
      .items(
        Joi.object({
          partId: mongoIdSchema.required(),
          partName: Joi.string().required(),
          quantity: Joi.number().min(1).required(),
          unit: Joi.string().required(),
          cost: Joi.number().min(0).optional(),
          notes: Joi.string().allow('').optional(),
        })
      )
      .min(1)
      .required(),
  }).required(),
});

// File upload schemas
const fileUploadSchema = Joi.object({
  files: Joi.array().items(
    Joi.object({
      fieldname: Joi.string().required(),
      originalname: Joi.string().required(),
      encoding: Joi.string().required(),
      mimetype: Joi.string().required(),
      size: Joi.number().required(),
      destination: Joi.string().required(),
      filename: Joi.string().required(),
      path: Joi.string().required(),
      buffer: Joi.binary().optional(),
    })
  ).required(),
});

module.exports = {
  validate,
  schemas: {
    // Task schemas
    taskId: taskIdSchema,
    taskQuery: taskQuerySchema,
    taskStatus: taskStatusSchema,
    checklist: checklistSchema,
    parts: partsSchema,
    
    // File schemas
    fileId: fileIdSchema,
    fileUpload: fileUploadSchema,
    
    // Common schemas
    mongoId: mongoIdSchema,
  },
};
