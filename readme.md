# Savage [![Build Status](https://secure.travis-ci.org/ben-bradley/savage.png)](http://travis-ci.org/ben-bradley/savage)

> Ooooohhh yeeah!

Kinda like Mongoose, but for REST with Promises!

## About

Savage is intended to make it possible to write code like you do with Mongoose, but for REST.

I came up with the name "Savage" after finding that "restler" was already taken.  I got to thinking though, "Who is an awesome wrestler?" and the first name that came to me was "Macho Man" Randy Savage.  Also the name wasn't taken in NPM.

Sooo, here we are.

## Intent

I found myself constantly writing controllers for REST calls using Request and Promises to do the heavy lifting with a bit of logic before and after the call to modify the actual HTTP request for things like authentication and validation.

Realizing that Mongoose had already addressed a lot of the issues that I was struggling with, just in the MongoDB space, I decided to write a module that would let me interact with REST operations in a similar fashion.

## Concepts

For all of the examples, I'm going to refer to a `http://localhost:3000` server that has the following basic REST CRUD routes/endpoints:

```
POST /users
GET /users
GET /users/{id}
PUT /users/{id}
DELETE /users/{id}
```

### Client

The `Client()` is just a way to create a re-usable model for a server.  Once you instantiate a `Client()`, you use that to create Endpoints.

Using our example server, you would create a Client like this:

```javascript
let Client = require('savage');

let client = new Client('http://localhost:3000');

/*
let client = new Client({
  url: 'http://localhost:3000',
  middleware: [
    (options, resolve, reject) => {
      // do something for all client.Endpoint()s
      resolve(options);
    }
  ]
});
*/
```

With a `client` created, you can now add Endpoint models with which you will interact.

You can also add middleware to a `client` object and all subsequent `Endpoint()`s will have those middlewares included.

### Endpoint

You can safely think of endpoints as the path parameters in a URL.

```javascript
let Client = require('savage');

let client = new Client('http://localhost:3000');

let users = new client.Endpoint('/users');

/*
let users = new client.Endpoint({
  path: '/users',
  middleware: [
    (options, resolve, reject) => {
      // do something for all CRUD calls for this client.Endpoint()
      resolve(options);
    }
  ]
});
*/
```

Calling `create()`, `read()`, `update()`, or `delete()` on your endpoint will issue the corresponding HTTP request and will return a Promise that produces a simplified Request response object that lazily attempts to convert the body to JSON.

```javascript
users.read() // GET http://localhost:3000/users
  .then((response) => {
    console.log(response.json); // outputs the response body as JSON
  })
```

```javascript
users.read('abc123') // GET http://localhost:3000/users/abc123
  .then((response) => {
    console.log(response.json); // outputs the response body as JSON
  })
```

### Middleware

The way that savage deals with middleware is pretty basic, but it gives a lot of flexibility to a call.

Middlewares can be added per `Client()`, per `client.Endpoint()` or per CRUD call and use the signature `(options, resolve, reject)`.

When calling `resolve()` inside a middleware, you MUST provide the `options` object.

When calling `reject()` inside a middleware, you SHOULD provide an `Error`.

#### Client-level middleware

The `getAccessToken()` call would happen for every subsequent endpoint call made for this client.

Client-level middleware persist for all endpoints.

```javascript
let Client = require('savage');

let client = new Client({
  url: 'http://localhost:3000',
  middleware: [
    (options, resolve, reject) => {
      getAccessToken((token) => {
        options.qs.access_token = token;
        // makes all HTTP calls have "?access_token={{token}}"
        resolve(options);
      })
    }
  ]
});
```

#### Endpoint-level

Endpoint-level middleware persist for all CRUD calls.

```javascript
let Client = require('savage');

let client = new Client({
  url: 'http://localhost:3000'
});

let users = new client.Endpoint({
  path: '/users',
  middleware: [
    (options, resolve, reject) => {
      getUserId((userId) => {
        options.qs.userId = userId;
        // all HTTP calls to /users have "?userId={{userId}}"
        resolve(options);
      })
    }
  ]
});
```

#### Call-level

Call-level middlewares DO NOT persist and MUST come before the CRUD method.

```javascript
let Client = require('savage');

let client = new Client({
  url: 'http://localhost:3000'
});

let users = new client.Endpoint({
  path: '/users'
});

users
  .use((options, resolve, reject) => {
    // do something to the request???
    options.headers.foo = 'bar';
    resolve(options);
  })
  .update('abc123', { username: 'alpha.bet' }) // PUT http://localhost:3000/users/abc123
  .then((response) => {
    console.log(response.json);
  })
```

## Versions

- 0.2.1 = Fix for when read() calls made w/o path args to prevent trailing slash
- 0.2.0 = Client() and Endpoint() accept strings and objects
- 0.1.0 = $ npm publish
- 0.0.* = Internal development & testing
