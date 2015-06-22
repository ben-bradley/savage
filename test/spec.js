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

function delayedMw(options, resolve, reject) {
  setTimeout(function() {
    options.headers.delayed = true;
    resolve(options);
  }, 1000);
}

function failedMw(options, resolve, reject) {
  process.nexttick(function() {
    reject(new Error('Middleware failure!'));
  })
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
      user.use(mw);
      (user).should.be.an.Object.with.properties([
        'url',
        'middleware'
      ]);
      (user.url).should.equal(clientOptions.url + endpointOptions.path);
      (user.middleware).should.be.an.Array.with.length(2);
    })

    it('should allow for chaining middleware', function () {
      client
        .use(mw)
        .use(mw);
      var user = new client.Endpoint(endpointOptions);
      user
        .use(mw)
        .use(mw);
      (user.middleware).should.be.an.Array.with.length(4);
    })

  })

  describe('read()', function () {

    var client;

    beforeEach(function (done) {
      client = new Client(clientOptions);
      server.start(done);
    });

    afterEach(function (done) {
      server.stop(done);
    });

    it('should return basic response to /users', function (done) {
      var user = new client.Endpoint(endpointOptions);
      user
        .use(mw)
        .use(delayedMw)
        .use(mw)
        .read()
        .then(function (response) {
          asserts.response(response);
          (response.json).should.be.an.Array;
          asserts.user(response.json[0]);
          done();
        })
        .catch(done);
    })

    it('should return basic response to /users/acb123', function (done) {
      var user = new client.Endpoint(endpointOptions);
      user
        .read('/abc123')
        .then(function (response) {
          asserts.response(response);
          asserts.user(response.json);
          done();
        })
        .catch(done);
    })

    it('should handle non-200 responses', function (done) {
      var user = new client.Endpoint(endpointOptions);
      user
        .read('/404')
        .then(function (response) {
          asserts.response(response);
          (response.statusCode).should.eql(404);
          done();
        })
        .catch(function (err) {
          (err).should.be.an.Error;
          done();
        });
    })

    it('should allow creating a new model', function (done) {
      var user = new client.Endpoint(endpointOptions);
      user
        .create({
          username: 'newguy'
        })
        .then(function (response) {
          asserts.response(response);
          done();
        })
        .catch(done);
    })

  })

})
