const routes = (handler) => [
  {
    method: 'POST',
    path: '/authentications',
    handler: handler.postAuthenticationHandler,
    options: {
      payload: {
        allow: ['application/json', 'multipart/form-data'],
        multipart: true,
        output: 'data'
      }
    }
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: handler.putAuthenticationHandler,
    options: {
      payload: {
        allow: ['application/json', 'multipart/form-data'],
        multipart: true,
        output: 'data'
      }
    }
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: handler.deleteAuthenticationHandler,
    options: {
      payload: {
        allow: ['application/json', 'multipart/form-data'],
        multipart: true,
        output: 'data'
      }
    }
  }
]

module.exports = routes
