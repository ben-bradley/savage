var should = require('should'),
  debug = require('debug')('savage:test/middleware');

var Client = require('../'),
  server = require('./server'),
  asserts = require('./asserts');

var util = require('./util');

var clientOptions = {
  url: 'http://localhost:3001',
  middleware: [
    function (options, resolve, reject) {
      options.headers.client_mw = true;
      resolve(options);
    }
  ]
}

var endpointOptions = {
  path: '/users',
  middleware: [
    function (options, resolve, reject) {
      options.headers.endpoint_mw = true;
      resolve(options);
    }
  ]
}

module.exports = function () {
  describe('use()', function () {

    beforeEach(function (done) {
      debug('server started');
      server.start(done);
    });

    afterEach(function (done) {
      server.stop(done);
    });

    it('Client middleware should cascade to Endpoints', function () {
      var client = new Client(clientOptions);

      var user = new client.Endpoint(endpointOptions);

      (user._clientMiddleware).should.be.an.Array.with.length(1);
    })

    it('Endpoint middleware should apply to CRUD calls', function (done) {
      var client = new Client(clientOptions);

      var user = new client.Endpoint(endpointOptions);

      user
        .read()
        .then(function (response) {
          asserts.response(response);
          (response.request.headers).should.be.an.Object.with.properties([
            'client_mw',
            'endpoint_mw'
          ]);
          done();
        })
        .catch(done);
    })

    it('CRUD middleware should apply to specific call', function (done) {
      var client = new Client(clientOptions);

      var user = new client.Endpoint(endpointOptions);

      user
        .use(function (options, resolve, reject) {
          options.qs.CRUD = true;
          resolve(options);
        })
        .read('abc123')
        .then(function (response) {
          (response.request.uri.query).should.eql('CRUD=true');
          user
            .update('abc123', { foo: 'bar' })
            .then(function(response) {
              (response.request.uri.query === null).should.eql(true, 'CRUD middleware persisted!');
              done();
            })
            .catch(done);
        })
        .catch(done);
    })

    it('Client & Endpoint mw should persist', function (done) {
      var client = new Client(clientOptions);

      var user = new client.Endpoint(endpointOptions);

      user
        .use(function (options, resolve, reject) {
          options.qs.CRUD = true;
          resolve(options);
        })
        .read('abc123')
        .then(function (response) {
          (response.request.uri.query).should.eql('CRUD=true');
          user
            .read('abc123')
            .then(function(response) {
              (response.request.uri.query === null).should.eql(true, 'CRUD middleware persisted!');
              (response.request.headers).should.be.an.Object.with.properties([
                'client_mw',
                'endpoint_mw'
              ]);
              done();
            })
            .catch(done);
        })
        .catch(done);
    })

  })
}
