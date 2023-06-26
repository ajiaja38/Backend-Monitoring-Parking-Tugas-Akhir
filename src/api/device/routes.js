const routes = (handler, authorizationsService) => [
  {
    method: 'POST',
    path: '/device',
    handler: handler.postDeviceHandler,
    options: {
      payload: {
        allow: ['application/json', 'multipart/form-data'],
        multipart: true,
        output: 'data'
      },
      auth: 'monitoringParking_jwt'
    }
  },
  {
    method: 'GET',
    path: '/device',
    handler: handler.getDevicesHandler,
    options: {
      auth: 'monitoringParking_jwt'
    }
  },
  {
    method: 'GET',
    path: '/device/{id}',
    handler: handler.getDeviceByIdHandler,
    options: {
      auth: 'monitoringParking_jwt',
      pre: [
        { method: authorizationsService.verifyOwnerDeviceOrAdminScope }
      ]
    }
  },
  {
    method: 'GET',
    path: '/devicepagination',
    handler: handler.getPaginateDeviceHandler,
    options: {
      auth: 'monitoringParking_jwt'
    }
  },
  {
    method: 'PUT',
    path: '/device/{id}',
    handler: handler.putDeviceByIdHandler,
    options: {
      payload: {
        allow: ['application/json', 'multipart/form-data'],
        multipart: true,
        output: 'data'
      },
      auth: 'monitoringParking_jwt',
      pre: [
        { method: authorizationsService.verifyOwnerDeviceOrAdminScope }
      ]
    }
  },
  {
    method: 'DELETE',
    path: '/device/{id}',
    handler: handler.deleteDeviceByIdHandler,
    options: {
      auth: 'monitoringParking_jwt',
      pre: [
        { method: authorizationsService.verifyOwnerDeviceOrAdminScope }
      ]
    }
  },
  {
    method: 'PUT',
    path: '/device/partner/{id}',
    handler: handler.putDevicePartnerByIdHandler,
    options: {
      payload: {
        allow: ['application/json', 'multipart/form-data'],
        multipart: true,
        output: 'data'
      },
      auth: 'monitoringParking_jwt',
      pre: [
        { method: authorizationsService.verifyOwnerDeviceOrAdminScope }
      ]
    }
  }
]

module.exports = routes
