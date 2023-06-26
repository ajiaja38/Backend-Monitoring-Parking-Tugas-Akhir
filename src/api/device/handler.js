const autoBind = require('auto-bind')

class DevicesHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    autoBind(this)
  }

  async postDeviceHandler (request) {
    this._validator.validateDevicePayload(request.payload)
    const { id: credentialsId } = request.auth.credentials

    const deviceName = await this._service.addDevice(credentialsId, request.payload)

    return {
      status: 'success',
      message: `Berhasil Menambahkan Device ${deviceName}`
    }
  }

  async getDevicesHandler () {
    const devices = await this._service.getDevices()

    return {
      status: 'success',
      data: devices
    }
  }

  async getDeviceByIdHandler (request) {
    const { id: deviceId } = request.params

    const device = await this._service.getDevicesById(deviceId)

    return {
      status: 'success',
      data: device
    }
  }

  async getPaginateDeviceHandler (request) {
    const { id: credentialsId } = request.auth.credentials
    const page = parseInt(request.query.page)
    const limit = parseInt(request.query.limit)

    const data = await this._service.getPaginateData(credentialsId, page, limit)

    return {
      status: 'success',
      data
    }
  }

  async putDeviceByIdHandler (request) {
    const { id: guid } = request.params

    const deviceName = await this._service.updateDevicesById(guid, request.payload)

    return {
      status: 'success',
      message: `Device ${deviceName} berhasil diperbarui`
    }
  }

  async deleteDeviceByIdHandler (request) {
    const { id: deviceId } = request.params

    const deviceName = await this._service.deleteDeviceById(deviceId)

    return {
      status: 'success',
      message: `Device ${deviceName} berhasil dihapus`
    }
  }

  async putDevicePartnerByIdHandler (request) {
    const { id: guid } = request.params
    const deviceName = await this._service.addPartnerDevice(guid, request.payload)

    return {
      status: 'success',
      message: `Berhasil menambahkan Device Partner pada Device ${deviceName}`
    }
  }
}

module.exports = DevicesHandler
