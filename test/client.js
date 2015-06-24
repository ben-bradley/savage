var should = require('should'),
  debug = require('debug')('savage:test/delete');

var Client = require('../'),
  server = require('./server'),
  asserts = require('./asserts');

var util = require('./util');

module.exports = function () {

  describe('Client()', function() {

    it('should be a function', function () {
      (Client).should.be.a.Function;
    })

    it('should return an instance of a client', function () {
      var client = new Client(util.clientOptions);
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
      var client = new Client(util.clientOptions);
      client.use(util.mw);
      (client.middleware.length).should.equal(1);
    })

    it('should allow just providing a string for URL', function() {
      var client = new Client(util.clientOptions.url);
      (client).should.be.an.instanceOf(Client);
      (client).should.be.an.Object.with.properties([
        'url',
        'middleware',
        'Endpoint',
        'use'
      ]);
      (client.Endpoint).should.be.a.Function;
      (client.use).should.be.a.Function;
      (client.url).should.eql(util.clientOptions.url);
    })

  })

};
