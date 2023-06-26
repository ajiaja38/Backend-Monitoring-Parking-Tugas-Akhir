const Authentications = require('../../models/authentications')
const InvariantError = require('../../error/InvariantError')

class AuthenticationsService {
  constructor () {
    this._auth = Authentications
  }

  async addRefreshToken (token, id) {
    const schema = {
      token,
      userId: id
    }

    const result = await this._auth(schema)
    await result.save()
  }

  async verifyRefreshToken (token) {
    const result = await this._auth.findOne({ token })

    if (!result) {
      throw new InvariantError('Refresh Token Tidak Valid')
    }
  }

  async deleteRefreshToken (token) {
    await this._auth.findOneAndDelete({ token })
  }
}

module.exports = AuthenticationsService
