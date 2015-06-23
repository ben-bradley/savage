# Savage

> Ooooohhh yeeah!

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

#### ES2015

```javascript
let Client = require('savage');

let client = new Client({
  url: 'http://localhost:3000'
});
```

With a `client` created, you can now add Endpoint models with which you will interact.

You can also add middleware to a `client` object and all subsequent `Endpoint()`s will have those middlewares included.

### Endpoint

You can safely think of endpoints as the path parameters in a URL.

#### ES2015

```javascript
let Client = require('savage');

let client = new Client({
  url: 'http://localhost:3000'
});

let users = new client.Endpoint({
  path: '/users'
});
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

## Todo

- Finish writing readme
- Publish








# Your ES6 App!

> A winner is you!

## Directory structure

```
config/
dist/
src/
  index.js
  bar.js
gulpfile.js
index.js
package.json
readme.md
```

## Gulps

- `gulp` - builds current `src/` to `dist/`, watches/builds `src/*.js`, and nodemons `index.js`
- `gulp build` - builds current `src/` to `dist/` and exits
- `gulp watch` - builds current `src/` to `dist/` and watches/builds `src/*.js`
- `gulp nodemon` - nodemons `index.js`

The app comes with `config` by default so you can use `NODE_ENV=xxx` to set up your environment

## Workflow

The idea is that you work on code in the `src/` directory and when you save it, gulp will "compile" it from ES6 to ES5 and re-run your `index.js` automagically.

1 Start `gulp`
2 Edit & save code in `src/`
3 Observe changes to app (app restarts via nodemon)

If you'd prefer to execute your code manually:

1 Start `gulp watch`
2 Edit & save code in `src/`
3 Run your code `node ./index.js`
