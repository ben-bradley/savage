var should = require('should'),
  debug = require('debug')('savage:test/update');

var Client = require('../'),
  server = require('./server'),
  asserts = require('./asserts');

var util = require('./util');

module.exports = function () {
  describe('update()', function () {

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

    it('should allow updating an existing model', function (done) {
      user
        .update('/fake', {
          username: 'sameguy'
        })
        .then(function (response) {
          asserts.response(response);
          asserts.user(response.json);
          (response.json.username).should.eql('sameguy');
          process.nextTick(done); // simulated async
        })
        .catch(done);
    })

    it('should allow omitting the forward-slash', function (done) {
      user
        .update('fake', {
          username: 'sameguy'
        })
        .then(function (response) {
          asserts.response(response);
          asserts.user(response.json);
          (response.json.username).should.eql('sameguy');
          process.nextTick(done); // simulated async
        })
        .catch(done);
    })

    it('should fail if no data is provided', function () {
      (function () {
        user.update()
      }).should.throw;
    })

    it('should use middleware', function (done) {
      user
        .use(util.mw)
        .use(util.delayedMw)
        .use(util.mw)
        .update('/fake', {
          id: 'fake',
          username: 'newguy'
        })
        .then(function (response) {
          asserts.response(response);
          asserts.user(response.json);
          asserts.middleware(response);
          (response.json.id).should.eql('fake');
          (response.json.username).should.eql('newguy');
          done();
        })
        .catch(done);
    })

  })
}
