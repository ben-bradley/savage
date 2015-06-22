var Hapi = require('hapi'),
  Boom = require('boom');

var server = new Hapi.Server();

server.connection({
  port: 3001
})

server.route({
  method: 'get',
  path: '/users',
  handler: function(request, reply) {
    reply([{
      id: 'abc123',
      username: 'joeuser'
    }])
  }
})

server.route({
  method: 'get',
  path: '/users/abc123',
  handler: function(request, reply) {
    reply({
      id: 'abc123',
      username: 'joeuser'
    })
  }
})

server.route({
  method: 'post',
  path: '/users',
  handler: function(request, reply) {
    reply({
      payload: request.payload
    })
  }
})

server.route({
  method: 'get',
  path: '/users/404',
  handler: function(request, reply) {
    reply(Boom.notFound());
  }
})

module.exports = server;
