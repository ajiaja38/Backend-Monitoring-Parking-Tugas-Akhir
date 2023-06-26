const InvariantError = require('../../error/InvariantError')
const { UserPayloadSchema, OtpPayloadSchema } = require('./schema')

const UsersValidator = {
  validateUserPayload: (payload) => {
    const validationResult = UserPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError('Password yang anda masukkan kurang dari 8 karakter!')
    }
  },
  validateOtpPayload: (payload) => {
    const validationResult = OtpPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = UsersValidator
