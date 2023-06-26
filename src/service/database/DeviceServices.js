const Device = require('../../models/device')
const Users = require('../../models/users')
const InvariantError = require('../../error/InvariantError')
const NotFoundError = require('../../error/NotFoundError')
const { mapDBDeviceToModel } = require('../../utils')
const AuthorizationError = require('../../error/AuthorizationError')

class DeviceService {
  constructor () {
    this._device = Device
    this._users = Users
  }

  async addDevice (userId, { guid, name, latitude, longtitude, mac, type }) {
    await this.verifyDuplicateData(guid, name, userId)

    const user = await this._users.findOne({ id: userId })

    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    if (type !== 'aktuator' && type !== 'sensor') {
      throw new InvariantError('Tipe perangkat hanya tersedia berupa aktuator dan sensor!')
    }

    const schema = {
      guid,
      name,
      latitude,
      longtitude,
      mac,
      type,
      owner: {
        id: user.id,
        name: user.fullname
      },
      createdAt,
      updatedAt
    }

    const result = await this._device(schema)
    await result.save()

    if (!result) {
      throw new InvariantError('Gagal menambahkan data device')
    }

    return result.name
  }

  async getDevices () {
    const result = await this._device.find()

    if (result.length === 0) {
      throw new NotFoundError('Anda belum memiliki Device yang terdaftar!')
    }

    return result.map(mapDBDeviceToModel)
  }

  async getDevicesById (guid) {
    const result = await this._device.findOne({ guid })

    if (!result) {
      throw new NotFoundError('Gagal mendapatkan data Devices, Id tidak ditemukan!')
    }

    return mapDBDeviceToModel(result)
  }

  async getPaginateData (credentialsId, page, limit) {
    const user = await this._users.findOne({ id: credentialsId })

    let devices
    let totalDevices
    let totalPages

    if (user.role === 'user') {
      totalDevices = await this._device.countDocuments({ 'owner.id': credentialsId })
      totalPages = Math.ceil(totalDevices / limit)
      devices = await this._device.find({ 'owner.id': credentialsId }).skip((page - 1) * limit).limit(limit)
    } else {
      totalDevices = await this._device.countDocuments()
      totalPages = Math.ceil(totalDevices / limit)
      devices = await this._device.find().skip((page - 1) * limit).limit(limit)
    }

    if (devices.length === 0) {
      throw new NotFoundError('Anda belum memiliki Device yang terdaftar!')
    }

    return {
      devices,
      page,
      totalDevices,
      totalPages
    }
  }

  async updateDevicesById (guid, { guidPayload, name, latitude, longtitude, mac, type }) {
    await this.verifyDuplicateData(name, guid)

    const updatedAt = new Date().toISOString()

    if (type !== 'aktuator' && type !== 'sensor') {
      throw new InvariantError('Tipe perangkat hanya tersedia berupa aktuator dan sensor!')
    }

    const result = await this._device.findOneAndUpdate(
      { guid },
      {
        guid: guidPayload,
        name,
        latitude,
        longtitude,
        updatedAt,
        mac,
        type
      },
      { new: true }
    )

    if (!result) {
      throw new NotFoundError('Gagal memperbarui data Device, Id tidak ditemukan')
    }

    return result.name
  }

  async deleteDeviceById (guid) {
    const result = await this._device.findOneAndDelete({ guid })

    if (!result) {
      throw new NotFoundError('Gagal menghapus data device, id tidak ditemukan')
    }

    await this._device.updateMany(
      { 'partner.guid': guid },
      { $pull: { partner: { guid } } }
    )

    return result.name
  }

  async verifyDuplicateData (guid, name, id = null) {
    const sameGuid = await this._device.findOne({ guid })
    const sameName = await this._device.findOne({ name })

    if (sameGuid && sameGuid.guid !== id) {
      throw new InvariantError('Guid perangkat telah digunakan, mohon ganti dengan perangkat yang belum terdaftar!')
    }

    if (sameName && sameName.guid !== id) {
      throw new InvariantError('Nama telah digunakan, mohon ganti nama device lain!')
    }
  }

  async addPartnerDevice (idCurrent, { guidPayload }) {
    const devicePartner = await this._device.findOne({ guid: guidPayload })

    if (!devicePartner) {
      throw new NotFoundError('Gagal menambahkan partner Device, Id yang anda masukkan tidak ditemukan!')
    }

    const deviceCurrent = await this._device.findOne({ guid: idCurrent })

    if (!deviceCurrent) {
      throw new NotFoundError('Gagal menambahkan partner Device, Id Current Device tidak ditemukan!')
    }

    if (devicePartner.guid === deviceCurrent.guid) {
      throw new InvariantError('Anda tidak bisa memasukkan id pada perangkat ini sendiri!')
    }

    const isPartnerExist = await this._device.findOne({
      guid: deviceCurrent.guid,
      partner: { $elemMatch: { guid: devicePartner.guid } }
    })

    if (isPartnerExist) {
      throw new InvariantError('Anda tidak bisa memasukkan Id perangkat yang sudah menjadi partner pada perangkat ini!')
    }

    if (deviceCurrent.owner.id !== devicePartner.owner.id) {
      throw new AuthorizationError('Anda tidak bisa mendaftarkan perangkat pengguna lain sebagai partner!')
    }

    await this._device.updateOne(
      { guid: deviceCurrent.guid },
      { $push: { partner: { guid: devicePartner.guid } } }
    )

    await this._device.updateOne(
      { guid: devicePartner.guid },
      { $push: { partner: { guid: deviceCurrent.guid } } }
    )

    return deviceCurrent.name
  }

  async verifyOwnerDevice (guid) {
    const ownerId = await this._device.findOne({ guid })

    if (!ownerId) {
      throw new NotFoundError('Id Device tidak ditemukan!')
    }

    return ownerId.owner.id
  }
}

module.exports = DeviceService
