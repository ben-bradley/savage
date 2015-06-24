var should = require('should'),
  debug = require('debug')('savage:test/delete');

var Client = require('../'),
  server = require('./server'),
  asserts = require('./asserts');

var util = require('./util');

module.exports = function () {
  describe('delete()', function () {

    var client,
      user;

    beforeEach(function (done) {
      client = new Client(util.clientOptions);
      user = new client.Endpoint(util.endpointOptions);
      server.start(function () {
        user.create(util.user)
          .then(function () {
            done();
          })
      });
    });

    afterEach(function (done) {
      server.stop(done);
    });

    it('should allow deleting an existing model', function (done) {
      user
        .delete('/fake')
        .then(function (response) {
          asserts.response(response);
          (response.json).should.be.an.Object.with.properties(['deleted']);
          (response.json.deleted).should.eql(1);
          process.nextTick(done); // simulated async
        })
        .catch(done);
    })

    it('should allow omitting the forward-slash', function (done) {
      user
        .delete('fake')
        .then(function (response) {
          asserts.response(response);
          (response.json).should.be.an.Object.with.properties(['deleted']);
          (response.json.deleted).should.eql(1);
          process.nextTick(done); // simulated async
        })
        .catch(done);
    })

  })
}
