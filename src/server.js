require('dotenv').config()

const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')
const Inert = require('@hapi/inert')
const { resolve } = require('path')
const colors = require('colors')

const { credentials, databases, jwt } = require('./config/index')
const ClientError = require('./error/ClientError')

const users = require('./api/user')
const UsersService = require('./service/database/UsersServices')
const UsersValidator = require('./validator/users')

const devices = require('./api/device')
const DeviceService = require('./service/database/DeviceServices')
const DeviceValidator = require('./validator/device')

const authentications = require('./api/authentication')
const AuthenticationsService = require('./service/database/AuthenticationsServices')
const TokenManager = require('./jwt/TokenManager')
const AuthenticationsValidator = require('./validator/authentications')

const StorageService = require('./service/uploads/StorageServices')
const UploadsValidator = require('./validator/uploads')

const AuthorizationsService = require('./service/middleware/AuthorizationService')

const NotificationService = require('./service/messages/NotificationService')

const {
  accessTokenKey,
  accessTokenAge
} = jwt

const init = async () => {
  const notificationService = new NotificationService()
  const usersService = new UsersService(notificationService)
  const deviceService = new DeviceService()
  const authenticationsService = new AuthenticationsService()
  const authorizationsService = new AuthorizationsService(usersService, deviceService)
  const storageService = new StorageService(resolve(__dirname, 'api/user/file/images'))

  const server = Hapi.Server({
    port: process.env.HTTPS_PORT,
    tls: credentials,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  await server.register([
    {
      plugin: Jwt
    },
    {
      plugin: Inert
    }
  ])

  server.auth.strategy('monitoringParking_jwt', 'jwt', {
    keys: accessTokenKey,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: accessTokenAge
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id
      }
    })
  })

  server.route({
    method: 'GET',
    path: '/',
    handler: () => {
      return '<h1>Hello World, selamat datang Hapi API Smart Bell</h1>'
    }
  })

  await server.register([
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
        authorizationsService,
        storageService,
        uploadsValidator: UploadsValidator
      }
    },
    {
      plugin: devices,
      options: {
        service: deviceService,
        validator: DeviceValidator,
        authorizationsService
      }
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator
      }
    }
  ])

  server.ext('onPreResponse', (request, h) => {
    const { response } = request
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message
        })
        newResponse.code(response.statusCode)
        console.error(`${colors.red(`Error ${newResponse.statusCode}`)} ${colors.yellow(`${newResponse.source.message}`)}`)
        return newResponse
      }
      if (!response.isServer) {
        return h.continue
      }
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami'
      })
      newResponse.code(500)
      console.error(`${colors.red(`Error ${newResponse.statusCode}`)} ${colors.yellow(`${newResponse.source.message}`)}`)
      return newResponse
    }
    return h.continue
  })

  await databases()
  await server.start()
  console.log(`Server running on https://${process.env.HTTPS_HOST}:${process.env.HTTPS_PORT}`)
}

init()
