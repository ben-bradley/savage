'use strict';

module.exports.clientOptions = {
  url: 'http://localhost:3001'
};

module.exports.endpointOptions = {
  path: '/users',
  middleware: [
    function (options, resolve, reject) {
      options.qs.foo = 'bar';
      resolve(options);
    }
  ]
};

module.exports.user = {
  id: 'fake',
  username: 'newguy'
};

function mw(options, resolve, reject) {
  options.headers.foo = 'bar';
  options._mw = (options._mw) ? options._mw + 1 : 1;
  resolve(options);
}
module.exports.mw = mw;

function delayedMw(options, resolve, reject) {
  setTimeout(function () {
    options.headers.delayed = true;
    resolve(options);
  }, 1000);
}
module.exports.delayedMw = delayedMw;

function failedMw(options, resolve, reject) {
  process.nexttick(function () {
    reject(new Error('Middleware failure!'));
  });
}
module.exports.failedMw = failedMw;
