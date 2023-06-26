const Joi = require('joi')

const UserPayloadSchema = Joi.object({
  fullname: Joi.string().max(50).required(),
  username: Joi.string().required(),
  password: Joi.string().min(8).pattern(/^[a-zA-Z0-9]{3,30}$/),
  confirmPassword: Joi.string().required(),
  email: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  address: Joi.string().required(),
  role: Joi.string()
})

const OtpPayloadSchema = Joi.object({
  otpPayload: Joi.string().min(6).max(6).required()
})

module.exports = { UserPayloadSchema, OtpPayloadSchema }
