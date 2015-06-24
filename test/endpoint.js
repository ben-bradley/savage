var should = require('should'),
  debug = require('debug')('savage:test/delete');

var Client = require('../'),
  server = require('./server'),
  asserts = require('./asserts');

var util = require('./util');

module.exports = function () {

  describe('Endpoint', function () {

    var client;

    beforeEach(function () {
      client = new Client(util.clientOptions);
    })

    it('should be built based on the client', function () {
      client.use(util.mw);
      var user = new client.Endpoint(util.endpointOptions);
      (user).should.be.an.instanceOf(client.Endpoint);
      user.use(util.mw);
      (user).should.be.an.Object.with.properties([
        'url',
        'middleware'
      ]);
      (user.url).should.equal(util.clientOptions.url + util.endpointOptions.path);
      (user.middleware).should.be.an.Array.with.length(1);
      (user._clientMiddleware).should.be.an.Array.with.length(1);
    })

    it('should allow for chaining middleware', function () {
      client
        .use(util.mw)
        .use(util.mw);
      var user = new client.Endpoint({
        path: '/users',
        middleware: [
          function(options, resolve, reject) {
            resolve(options);
          }
        ]
      });
      user
        .use(util.mw)
        .use(util.mw);
      (user.middleware).should.be.an.Array.with.length(2);
      (user._clientMiddleware).should.be.an.Array.with.length(2);
      (user._endpointMiddleware).should.be.an.Array.with.length(1);
    })

    it('should allow using a string for the options', function() {
      var user = new client.Endpoint(util.endpointOptions.path);
      (user).should.be.an.instanceOf(client.Endpoint);
      user.use(util.mw);
      (user).should.be.an.Object.with.properties([
        'url',
        'middleware'
      ]);
      (user.url).should.equal(util.clientOptions.url + util.endpointOptions.path);
      (user.middleware).should.be.an.Array.with.length(1);
    })

  })
};
