let request = require('request'),
  debug = require('debug')('savage:index'),
  q = require('q');

let Promise = Promise || q.Promise;

/**
 * This is just a fancy way of constructing an object
 * @param   {Object}     options This is the base request options object
 * @returns {Connection} This returns a Connection object
 */
class Connection {
  constructor(options) {
    let {
      url,
      middleware = []
    } = options;

    if (!url)
      throw new Error('You must specify a url property');

    this.url = url;
    this.middleware = middleware;

    this.Endpoint = Endpoint.bind(this, {
      url: this.url,
      middleware: this.middleware
    });

    debug('Connection: ', this);
  }

  /**
   * Assigne Connection-level middleware
   * @param   {Function} mw A middleware function to modify the request object
   * @returns {This}     Returns this for chaining
   */
  use(mw) {
    if (typeof mw !== 'function')
      throw new Error('Your middleware must be a function');
    this.middleware.push(mw);
    debug('adding middleware: ', mw);
    return this;
  }
}

/**
 * Constructs the endpoint model
 * @param {Connection} cn Expects a Connection object to construct the options
 * @param {Object}     Returns an Endpoint model
 */
class Endpoint {
  constructor(cn, options) {
    let {
      path,
      middleware = []
    } = options;

    if (!path)
      throw new Error('You must specify a path property');

    this.url = cn.url + path;
    this._clientMiddleware = cn.middleware;
    this._endpointMiddleware = middleware;
    this.middleware = [];

    debug('Endpoint: ', this);
  }

  /**
   * Assigne Endpoint-level middleware
   * @param   {Function} mw A middleware function to modify the request object
   * @returns {This}     Returns this for chaining
   */
  use(mw) {
    if (typeof mw !== 'function')
      throw new Error('Your middleware must be a function');
    this.middleware.push(mw);
    debug('adding middleware: ', mw);
    return this;
  }

  /**
   * The create() method on a model
   * Example: users.create({ name: 'jdoe', email: 'jdoe@example.com' }).then()
   *
   * @param   {Object}  data    Required: An object to create on the server
   * @returns {Promise} Returns a promise to create an object on the server
   */
  create(data) {
    if (!data)
      throw new Error('A create() call must provide a data object');

    let options = {
      url: this.url,
      method: 'post',
      form: data
    }

    debug('create(): ', options);

    return this._processMiddleware(options);
  }

  /**
   * The read() method on a model
   * Example: users.read().then() // reads all models
   * Example: users.read('/jdoe').then() // reads the jdoe user
   *
   * @param   {String}  path    Optional: An optional string value to read a specific record
   * @returns {Promise} Returns a promise to read an object/array from the server
   */
  read(path) {
    if (!path)
      path = '';

    if (!/^\//.test(path))
      path = '/' + path;

    let options = {
      url: this.url + path,
      method: 'get'
    }

    debug('read(): ', options);

    return this._processMiddleware(options);
  }

  /**
   * The update() method on a model
   * Example: users.update('/jdoe', { email: 'johndoe@example.com' }).then()
   *
   * @param   {String}  path    Required: The id of the record to update
   * @param   {Object}  data    Required: The data to POST for the update
   * @returns {Promise} Returns a promise to update a record
   */
  update(path, data) {
    if (!path)
      throw new Error('An update() call requires a path argument');
    else if (!data)
      throw new Error('An update() call requires a data argument');

    if (!/^\//.test(path))
      path = '/' + path;

    let options = {
      url: this.url + path,
      method: 'put',
      form: data
    }

    debug('update(): ', options);

    return this._processMiddleware(options);
  }

  /**
   * The delete() method on a model
   * Example: users.delete('/jdoe').then()
   *
   * @param   {String}  path    Required: The id of the record to delete
   * @returns {Promise} Returns a promise to delete the record
   */
  delete(path) {
    if (!path)
      throw new Error('A delete() call requires a path argument');

    if (!/^\//.test(path))
      path = '/' + path;

    let options = {
      url: this.url + path,
      method: 'delete'
    }

    debug('delete(): ', options);

    return this._processMiddleware(options);
  }

  /**
   * Internal fn to iterate the middleware array & issue the request
   * @param   {Object}  options The options as built by the CRUD method
   * @returns {Promise} Returns the _request promise
   */
  _processMiddleware(options) {
    let middleware = [].concat(this.middleware, this._clientMiddleware, this._endpointMiddleware);
    this.middleware = [];
    debug('processing middleware: ', middleware);

    if (!options.headers)
      options.headers = {};

    if (!options.qs)
      options.qs = {};

    function iterate(mw, options) {
      return Promise((resolve, reject) => {
        if (mw)
          return mw(options, resolve, reject);
        resolve(options);
      }).then((options) => {
        if (!options)
          throw new Error('Middleware didn\'t return the options object');
        let next = middleware.shift();
        if (next)
          return iterate(next, options);
        return _request(options);
      });
    }

    return iterate(null, options);
  }

}

/**
 * Internal fn to issue the HTTP request
 * @param   {Object}  options The Request options object
 * @returns {Promise} Returns a promise for easy handling
 */
function _request(options) {
  return Promise((resolve, reject) => {
    debug('Requesting: ', options);
    request(options, function (err, response, data) {
      debug('Response: ', !!err, !!response, !!data);
      if (err)
        return reject(err);
      let res = response.toJSON();
      try { // lazy attempt to convert
        // TODO: check headers instead?
        res.json = JSON.parse(res.body);
      } catch (err) {}
      debug('Response: resolving => ', res);
      resolve(res);
    });
  });
}

// oink
module.exports = Connection;
