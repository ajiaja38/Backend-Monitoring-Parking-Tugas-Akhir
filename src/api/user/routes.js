const { resolve } = require('path')

const routes = (handler, authorizationsService) => [
  {
    method: 'POST',
    path: '/user',
    handler: handler.postUserHandler,
    options: {
      payload: {
        allow: ['application/json', 'multipart/form-data'],
        multipart: true,
        output: 'data'
      }
    }
  },
  {
    method: 'POST',
    path: '/user/otp',
    handler: handler.verifyUserOtpHandler,
    options: {
      payload: {
        allow: ['application/json', 'multipart/form-data'],
        multipart: true,
        output: 'data'
      }
    }
  },
  {
    method: 'GET',
    path: '/user',
    handler: handler.getUserHandler,
    options: {
      auth: 'monitoringParking_jwt',
      pre: [
        { method: authorizationsService.verifyAdminScope }
      ]
    }
  },
  {
    method: 'GET',
    path: '/user/{id}',
    handler: handler.getUserByIdHandler,
    options: {
      auth: 'monitoringParking_jwt',
      pre: [
        { method: authorizationsService.verifyUserUpdateScope }
      ]
    }
  },
  {
    method: 'GET',
    path: '/userpagination',
    handler: handler.getPaginateUsersHandler,
    options: {
      auth: 'monitoringParking_jwt',
      pre: [
        { method: authorizationsService.verifyAdminScope }
      ]
    }
  },
  {
    method: 'PUT',
    path: '/user/{id}',
    handler: handler.putUserByIdHandler,
    options: {
      payload: {
        allow: ['application/json', 'multipart/form-data'],
        multipart: true,
        output: 'data'
      },
      auth: 'monitoringParking_jwt',
      pre: [
        { method: authorizationsService.verifyUserUpdateScope }
      ]
    }
  },
  {
    method: 'DELETE',
    path: '/user/{id}',
    handler: handler.deleteUserByIdHandler,
    options: {
      auth: 'monitoringParking_jwt',
      pre: [
        { method: authorizationsService.verifyUserUpdateScope }
      ]
    }
  },
  {
    method: 'POST',
    path: '/user/{id}/images',
    handler: handler.postUploadAvatarHandler,
    options: {
      auth: 'monitoringParking_jwt',
      pre: [
        { method: authorizationsService.verifyUserUpdateScope }
      ],
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 5000000
      }
    }
  },
  {
    method: 'GET',
    path: '/user/images/{param*}',
    handler: {
      directory: {
        path: resolve(__dirname, 'file/images')
      }
    }
  }
]

module.exports = routes
