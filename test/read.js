var should = require('should'),
  debug = require('debug')('savage:test/read');

var Client = require('../'),
  server = require('./server'),
  asserts = require('./asserts');

var util = require('./util');

module.exports = function () {
  describe('read()', function () {

    var client,
      user;

    beforeEach(function (done) {
      client = new Client(util.clientOptions);
      user = new client.Endpoint(util.endpointOptions);
      server.start(done);
    });

    afterEach(function (done) {
      server.stop(done);
    });

    it('should return basic response to /users', function (done) {
      user
        .use(util.mw)
        .use(util.delayedMw)
        .use(util.mw)
        .read()
        .then(function (response) {
          asserts.response(response);
          (response.json).should.be.an.Array;
          asserts.user(response.json[0]);
          asserts.middleware(response);
          done();
        })
        .catch(done);
    })

    it('should return basic response to /users/acb123', function (done) {
      user
        .read('/abc123')
        .then(function (response) {
          asserts.response(response);
          asserts.user(response.json);
          done();
        })
        .catch(done);
    })

    it('should allow for omitting the forward-slash', function (done) {
      user
        .read('abc123')
        .then(function (response) {
          asserts.response(response);
          asserts.user(response.json);
          done();
        })
        .catch(done);
    })

    it('should handle non-200 responses', function (done) {
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

  })
}
