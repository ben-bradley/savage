var should = require('should'),
  debug = require('debug')('savage:test/create');

var Client = require('../'),
  server = require('./server'),
  asserts = require('./asserts');

var util = require('./util');

module.exports = function () {
  describe('create()', function () {

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

    it('should allow creating a new model', function (done) {
      user
        .create(util.user)
        .then(function (response) {
          asserts.response(response);
          process.nextTick(done); // simulated async
        })
        .catch(done);
    })

    it('should fail if no data is provided', function () {
      (function () {
        user.create()
      }).should.throw;
    })

    it('should use middleware', function (done) {
      user
        .use(util.mw)
        .use(util.delayedMw)
        .use(util.mw)
        .create(util.user)
        .then(function (response) {
          asserts.response(response);
          asserts.user(response.json);
          asserts.middleware(response);
          (response.json.id).should.eql(util.user.id);
          (response.json.username).should.eql(util.user.username);
          done();
        })
        .catch(done);
    })

  })
}
