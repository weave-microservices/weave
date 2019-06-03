# Weave web gateway


## Features
* support HTTP & HTTPS
* serve static files
* Routing
* Support for global and route level middlewares
* alias names (with named parameters & REST shorthand)
* whitelist
* multiple body parsers (json, urlencoded)
* CORS headers
* ETags
* HTTP2
* Rate limiter
* before & after call hooks
* Buffer & Stream handling
* middleware mode (use as a middleware in ExpressJS Application)
* support authorization

## Install
```
npm install @weave-js/web
```

## Usage

### Run with default settings
This example uses API Gateway service with default settings.
You can access to all services (including internal `$node.`) via `http://localhost:3000/`

```js
let { Weave } = require('@weave-js/core');
let ApiService = require('@weave-js/web');

let broker = new Weave({ logger: console });

// Create a service
broker.createService({
    name: 'test',
    actions: {
        hello() {
            return 'Hello API Gateway!'
        }
    }
});

// Load API Gateway
broker.createService(ApiService);

// Start server
broker.start();
```

**Test URLs:**	
- Call `test.hello` action: `http://localhost:3000/test/hello`

- Get health info of node: `http://localhost:3000/~node/health`
- List all actions: `http://localhost:3000/~node/actions`

## Documentation
Please read our [documentation on weave site](http://weave.services/docs/weave-web.html)

## Test
```
$ npm test
```
