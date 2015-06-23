var should = require('should'),
  debug = require('debug')('test/spec');

var Client = require('../'),
  server = require('./server'),
  asserts = require('./asserts');

var clientOptions = {
  url: 'http://localhost:3001'
};

var endpointOptions = {
  path: '/users'
};

function mw(options, resolve, reject) {
  options.headers.foo = 'bar';
  options._mw = (options._mw) ? options._mw + 1 : 1;
  resolve(options);
}

function mw2(options, resolve, reject) {
  options.headers.baz = 'qux';
  options._mw = (options._mw) ? options._mw + 1 : 1;
  resolve(options);
}

debug('starting tests...');

describe('Client', function () {

  it('should be a function', function () {
    (Client).should.be.a.Function;
  })

  it('should return an instance of a client', function () {
    var client = new Client(clientOptions);
    (client).should.be.an.instanceOf(Client);
    (client).should.be.an.Object.with.properties([
      'url',
      'middleware',
      'Endpoint',
      'use'
    ]);
    (client.Endpoint).should.be.a.Function;
    (client.use).should.be.a.Function;
  })

  it('should add callbacks to the middleware', function () {
    var client = new Client(clientOptions);
    client.use(mw);
    (client.middleware.length).should.equal(1);
  })

  describe('Endpoint', function () {

    var client;

    beforeEach(function () {
      client = new Client(clientOptions);
    })

    it('should be built based on the client', function () {
      client.use(mw);
      var user = new client.Endpoint(endpointOptions);
      (user).should.be.an.instanceOf(client.Endpoint);
      user.use(mw2);
      (user).should.be.an.Object.with.properties([
        'url',
        'middleware'
      ]);
      (user.url).should.equal(clientOptions.url + endpointOptions.path);
      (user.middleware).should.be.an.Array.with.length(1);
      (user._clientMiddleware).should.be.an.Array.with.length(1);
    })

    it('should allow for chaining middleware', function () {
      client
        .use(mw)
        .use(mw);
      var user = new client.Endpoint({
        path: '/users',
        middleware: [
          function(options, resolve, reject) {
            resolve(options);
          }
        ]
      });
      user
        .use(mw)
        .use(mw);
      (user.middleware).should.be.an.Array.with.length(2);
      (user._clientMiddleware).should.be.an.Array.with.length(2);
      (user._endpointMiddleware).should.be.an.Array.with.length(1);
    })

  })

  require('./create')();

  require('./read')();

  require('./update')();

  require('./delete')();

})
