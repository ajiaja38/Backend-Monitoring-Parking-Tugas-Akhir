const Jwt = require('@hapi/jwt')
const InvariantError = require('../error/InvariantError')
const { jwt } = require('../config/index')

const { accessTokenKey, refreshTokenKey } = jwt

const TokenManager = {
  generateAccessToken: (payload) => Jwt.token.generate(payload, accessTokenKey),
  generateRefreshToken: (payload) => Jwt.token.generate(payload, refreshTokenKey),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken)
      Jwt.token.verifySignature(artifacts, refreshTokenKey)
      const { payload } = artifacts.decoded
      return payload
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid')
    }
  }
}

module.exports = TokenManager
