const UsersHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'users',
  version: '1.0.0',
  register: async (server, { service, validator, authorizationsService, storageService, uploadsValidator }) => {
    const userHandler = new UsersHandler(service, validator, storageService, uploadsValidator)
    server.route(routes(userHandler, authorizationsService))
  }
}
