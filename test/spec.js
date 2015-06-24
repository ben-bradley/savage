var should = require('should'),
  debug = require('debug')('savage:test/spec');

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

describe('Savage', function () {

  require('./client')();

  require('./endpoint')();

  require('./middleware')();

  require('./create')();

  require('./read')();

  require('./update')();

  require('./delete')();

})
