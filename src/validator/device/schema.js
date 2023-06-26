const Joi = require('joi')

const DevicePayloadSchema = Joi.object({
  guid: Joi.string().required(),
  name: Joi.string().required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longtitude: Joi.number().min(-180).max(180).required(),
  mac: Joi.string().required(),
  type: Joi.string().required()
})

module.exports = { DevicePayloadSchema }
