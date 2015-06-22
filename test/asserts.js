var should = require('should');

module.exports.response = function(response) {
  (response).should.be.an.Object.with.properties([
    'body',
    'headers',
    'json',
    'request',
    'statusCode'
  ]);
}

module.exports.user = function(user) {
  (user).should.be.an.Object.with.properties([
    'id',
    'username'
  ]);
}
