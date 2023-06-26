const autoBind = require('auto-bind')

class AuthorizationService {
  constructor (userService, deviceService) {
    this._userService = userService
    this._deviceService = deviceService

    autoBind(this)
  }

  async verifyAdminScope (request, h) {
    const { id } = request.auth.credentials
    await this._userService.verifyRoleAdminScope(id)

    return h.continue
  }

  async verifyUserUpdateScope (request, h) {
    const { id: credentialsId } = request.auth.credentials
    const { id: userId } = request.params

    if (credentialsId !== userId) {
      await this._userService.verifyRoleAdminScope(credentialsId)
    }

    return h.continue
  }

  async verifyOwnerDeviceOrAdminScope (request, h) {
    const { id: credentialsId } = request.auth.credentials
    const { id: guid } = request.params

    const ownerId = await this._deviceService.verifyOwnerDevice(guid)

    if (credentialsId !== ownerId) {
      await this._userService.verifyRoleAdminScope(credentialsId)
    }

    return h.continue
  }
}

module.exports = AuthorizationService
