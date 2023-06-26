const DevicesHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'devices',
  version: '1.0.0',
  register: async (server, { service, validator, authorizationsService }) => {
    const devicesHandler = new DevicesHandler(service, validator)
    server.route(routes(devicesHandler, authorizationsService))
  }
}
