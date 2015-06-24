var Hapi = require('hapi'),
  debug = require('debug')('savage:test/server'),
  Boom = require('boom');

var server = new Hapi.Server();

server.connection({
  port: 3001
})

var users = [{
  id: 'abc123',
  username: 'joeuser'
}];

function getUser(id) {
  var user = users.filter(function(u) {
    return u.id === id;
  });

  if (user[0])
    return user[0];

  return {};
}

server.route({
  method: 'get',
  path: '/users/{id*}',
  handler: function (request, reply) {
    debug('GET', request.params);
    if (!request.params.id)
      return reply(users);
    var user = getUser(request.params.id);
    reply(user);
  }
})

server.route({
  method: 'post',
  path: '/users',
  handler: function (request, reply) {
    debug('POST', request.paylaod);
    users.push(request.payload);
    reply(request.payload)
  }
})

server.route({
  method: 'put',
  path: '/users/{id}',
  handler: function (request, reply) {
    debug('PUT', request.params, request.payload);
    var user = getUser(request.params.id);
    if (!user || !user.id)
      return reply(Boom.notFound('User ' + request.params.id + ' not found'));
    for (var p in request.payload) {
      user[p] = request.payload[p];
    }
    reply(user);
  }
})

server.route({
  method: 'delete',
  path: '/users/{id}',
  handler: function (request, reply) {
    debug('DELETE', request.params);
    var user = getUser(request.params.id);
    if (!user || !user.id)
      return reply(Boom.notFound('User ' + request.params.id + ' not found'));
    reply({
      deleted: 1
    })
  }
})

server.route({
  method: 'get',
  path: '/users/404',
  handler: function (request, reply) {
    reply(Boom.notFound());
  }
})

module.exports = server;
