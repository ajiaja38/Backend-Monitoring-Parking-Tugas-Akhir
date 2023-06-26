const InvariantError = require('../../error/InvariantError')
const { DevicePayloadSchema } = require('./schema')

const DeviceValidator = {
  validateDevicePayload: (payload) => {
    const validationResult = DevicePayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = DeviceValidator
