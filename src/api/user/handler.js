const autoBind = require('auto-bind')

class UsersHandler {
  constructor (service, validator, storageService, uploadsValidator) {
    this._service = service
    this._validator = validator
    this._storageService = storageService
    this._uploadValidator = uploadsValidator

    autoBind(this)
  }

  async postUserHandler (request, h) {
    this._validator.validateUserPayload(request.payload)

    await this._service.addUser(request.payload)

    const response = h.response({
      status: 'success',
      message: 'Berhasil mengirimkan kode registrasi akun ke Email'
    })
    response.code(201)
    return response
  }

  async verifyUserOtpHandler (request, h) {
    this._validator.validateOtpPayload(request.payload)

    const { otpPayload } = request.payload

    const userId = await this._service.verifyOtp(otpPayload)

    const response = h.response({
      status: 'success',
      message: 'Berhasil Registrasi user',
      data: {
        userId
      }
    })
    response.code(201)
    return response
  }

  async getUserHandler () {
    const users = await this._service.getUsers()
    return {
      status: 'success',
      data: users
    }
  }

  async getUserByIdHandler (request) {
    const { id: userId } = request.params

    const user = await this._service.getUserById(userId)

    return {
      status: 'success',
      data: user
    }
  }

  async getPaginateUsersHandler (request) {
    const page = parseInt(request.query.page)
    const limit = parseInt(request.query.limit)

    const users = await this._service.getPaginateAllDataUser(page, limit)

    return {
      status: 'success',
      data: users
    }
  }

  async putUserByIdHandler (request) {
    const { id: userId } = request.params

    const username = await this._service.updateUserById(userId, request.payload)

    return {
      status: 'success',
      message: `Data ${username} telah berhasil diperbarui`
    }
  }

  async deleteUserByIdHandler (request) {
    const { id: userId } = request.params
    const username = await this._service.deleteUserById(userId)

    return {
      status: 'success',
      message: `Account ${username} telah berhasil dihapus`
    }
  }

  async postUploadAvatarHandler (request) {
    const { id: userId } = request.params
    const { avatar } = request.payload

    this._uploadValidator.validateImageHeaders(avatar.hapi.headers)
    const filename = await this._storageService.writeFile(avatar, avatar.hapi)
    const fileLocation = `https://camera.pptik.id/api/user/images/${filename}`

    await this._service.editUserAvatarById(userId, filename, fileLocation)

    return {
      status: 'success',
      message: 'Avatar berhasil diperbarui'
    }
  }
}

module.exports = UsersHandler
