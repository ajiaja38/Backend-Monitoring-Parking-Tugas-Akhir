const { nanoid } = require('nanoid')
const bcrypt = require('bcrypt')
const InvariantError = require('../../error/InvariantError')
const NotFoundError = require('../../error/NotFoundError')
const AuthenticationError = require('../../error/AuthenticationError')
const Users = require('../../models/users')
const UsersRestOTP = require('../../models/userRestOTP')
const Authentications = require('../../models/authentications')
const { mapDBUsersToModel } = require('../../utils')
const AuthorizationError = require('../../error/AuthorizationError')
const fs = require('fs')
const { resolve } = require('path')
const autoBind = require('auto-bind')

class UsersService {
  constructor (notificationService) {
    this._user = Users
    this._userRestOTP = UsersRestOTP
    this._auth = Authentications
    this._notificationService = notificationService

    autoBind(this)
  }

  async addUser ({ fullname, username, password, confirmPassword, email, phoneNumber, address, role = 'user' }) {
    await this.verifyDuplicateData(username, email, phoneNumber)

    const id = `user-${nanoid(16)}`

    if (password !== confirmPassword) {
      throw new InvariantError('Password dan Confirm Password tidak cocok!')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const otp = nanoid(6)

    const schema = {
      id,
      fullname,
      username,
      password: hashedPassword,
      email,
      phoneNumber,
      address,
      role,
      otp
    }

    const result = await this._userRestOTP(schema)

    if (!result) {
      throw new InvariantError('Gagal Menambahkan data sementara pada untuk register')
    }

    await result.save()

    setTimeout(async () => {
      await this._userRestOTP.findOneAndDelete({ otp })
    }, 3 * 60 * 1000)

    await this._notificationService.sendEmail(email, fullname, otp)
  }

  async verifyOtp (otpPayload) {
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const userRestOTP = await this._userRestOTP.findOne({ otp: otpPayload })

    if (!userRestOTP || userRestOTP.otp !== otpPayload) {
      throw new NotFoundError('Kode OTP yang anda masukkan salah / sudah expired')
    }

    const {
      id,
      fullname,
      username,
      password,
      email,
      phoneNumber,
      address,
      role
    } = userRestOTP

    const schema = {
      id,
      fullname,
      username,
      password,
      email,
      phoneNumber,
      address,
      role,
      createdAt,
      updatedAt
    }

    const result = await this._user(schema)
    await result.save()

    await this._userRestOTP.findOneAndDelete({ otp: otpPayload })

    return result.id
  }

  async getUsers () {
    const result = await this._user.find()

    if (!result) {
      throw new NotFoundError('User tidak ditemukan')
    }

    return result.map(mapDBUsersToModel)
  }

  async getUserById (id) {
    const result = await this._user.findOne({ id })

    if (!result) {
      throw new NotFoundError('Gagal mendapatkan data user, Id tidak ditemukan')
    }

    return mapDBUsersToModel(result)
  }

  async getPaginateAllDataUser (page, limit) {
    const totalUsers = await this._user.countDocuments()
    const totalPages = Math.ceil(totalUsers / limit)
    const users = await this._user.find().skip((page - 1) * limit).limit(limit)

    if (!users.length) {
      throw new NotFoundError('Belum ada users yang mendaftar!')
    }

    return {
      users,
      page,
      totalUsers,
      totalPages
    }
  }

  async updateUserById (id, { fullname, username, password, confirmPassword, email, phoneNumber, address, role = 'user' }) {
    await this.verifyDuplicateData(username, email, phoneNumber, id)

    const updatedAt = new Date().toISOString()

    if (password !== confirmPassword) {
      throw new InvariantError('Password dan Confirm Password tidak cocok!')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await this._user.findOneAndUpdate(
      { id },
      {
        fullname,
        username,
        password: hashedPassword,
        email,
        phoneNumber,
        address,
        role,
        updatedAt
      },
      { new: true }
    )

    if (!result) {
      throw new NotFoundError('Gagal memperbarui data user, Id tidak ditemukan')
    }

    return result.username
  }

  async editUserAvatarById (id, filename, fileLocation) {
    const updatedAt = new Date().toISOString()

    await this.deleteImageOnDir(id)

    const result = await this._user.findOneAndUpdate(
      { id },
      {
        avatar: filename,
        avatarUrl: fileLocation,
        updatedAt
      },
      { new: true }
    )

    if (!result) {
      throw new NotFoundError('Gagal memberbarui avatar, Id User tidak ditemukan!')
    }
  }

  async deleteUserById (id) {
    const user = await this._user.findOne({ id })

    if (!user) {
      throw new NotFoundError('Gagal menghapus User, Id Tidak ditemukan')
    }

    await this.deleteImageOnDir(id)

    const auth = await this._auth.findOne({ userId: id })

    if (auth) {
      await this._auth.findOneAndDelete({ userId: id })
    }

    const result = await this._user.findOneAndDelete({ id })

    return result.username
  }

  async verifyDuplicateData (username, email, phoneNumber, id = null) {
    const sameUsername = await this._user.findOne({ username })
    const sameEmail = await this._user.findOne({ email })
    const samephoneNumber = await this._user.findOne({ phoneNumber })

    if (sameUsername && sameUsername.id !== id) {
      throw new InvariantError('Username telah digunakan, mohon ganti username anda!')
    }

    if (sameEmail && sameEmail.id !== id) {
      throw new InvariantError('Email telah digunakan, mohon ganti email anda!')
    }

    if (samephoneNumber && samephoneNumber.id !== id) {
      throw new InvariantError('Nomor HP telah digunakan, mohon ganti nomor hp anda!')
    }
  }

  async verifyUserCredential ({ username, password }) {
    const user = await this._user.findOne({ username })

    if (!user) {
      throw new AuthenticationError('username tidak valid!')
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      throw new AuthenticationError('Password tidak valid!')
    }

    return user.id
  }

  async verifyRoleAdminScope (id) {
    const user = await this._user.findOne({ id })

    if (user.role !== 'admin') {
      throw new AuthorizationError('Anda tidak memiliki akses pada service ini!')
    }

    return user.role
  }

  async deleteImageOnDir (id) {
    const userData = await this._user.findOne({ id })

    if (userData.avatar !== null) {
      const oldAvatarPath = resolve(__dirname, `../../api/user/file/images/${userData.avatar}`)
      fs.unlink(oldAvatarPath, (err) => {
        if (err) throw err
      })
    }
  }
}

module.exports = UsersService
