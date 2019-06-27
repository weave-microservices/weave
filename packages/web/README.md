# @weave-js/web

> A Web Gateway for weave microservice architectures.

[![NPM Version](https://img.shields.io/npm/v/@weave-js/web.svg)](https://www.npmjs.com/package/@weave-js/core)
[![Build Status](https://travis-ci.com/weave-microservices/weave.svg?branch=master)](https://travis-ci.com/weave-microservices/weave)
[![Downloads](https://img.shields.io/npm/dt/@weave-js/web.svg)](https://www.npmjs.com/package/@weave-js/web)

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
You can access to all services (including internal `$node` services) via `http://localhost:3000/`

```js
let { Weave } = require('@weave-js/core')
let ApiMixin = require('@weave-js/web')

let broker = new Weave({ logger: console })

// Create a service
broker.createService({
    name: 'test',
    actions: {
        hello() {
            return 'Hello API Gateway!'
        }
    }
})

// Load API Gateway
broker.createService(ApiMixin)

// Start server
broker.start()
```

**Test URLs:**	
- Call `test.hello` action: `http://localhost:3000/test/hello`

- Get health info of node: `http://localhost:3000/~node/health`
- List all actions: `http://localhost:3000/~node/actions`

## Documentation
Please read our [documentation on weave site](http://weave.fachwerk.io)
