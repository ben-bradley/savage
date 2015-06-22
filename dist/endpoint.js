'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var debug = require('debug')('endpoint');

var Endpoint = function Endpoint(options) {
  _classCallCheck(this, Endpoint);

  debug(options);
};

module.exports = Endpoint;
