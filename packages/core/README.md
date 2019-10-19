<img src="https://raw.githubusercontent.com/fachw3rk/weave/HEAD/Logo.png" width="400">

[![NPM Version](https://img.shields.io/npm/v/@weave-js/core.svg)](https://www.npmjs.com/package/@weave-js/core)
[![Build Status](https://travis-ci.com/weave-microservices/weave.svg?branch=master)](https://travis-ci.com/weave-microservices/weave)
[![CodeFactor](https://www.codefactor.io/repository/github/weave-microservices/weave/badge)](https://www.codefactor.io/repository/github/weave-microservices/weave/overview/dev)
[![Dependencies](https://david-dm.org/weave-microservices/weave.svg)](https://david-dm.org/weave-microservices/weave.svg)
[![Downloads](https://img.shields.io/npm/dt/@weave-js/core.svg)](https://www.npmjs.com/package/@weave-js/core)

> Weave is a fast and easy to use microservice framework for NodeJS.


# Features

- No master/leader node
- Pluggable transporters (NATS, Redis)
- Automatic service discovery
- Multiple services per node
- Service mixins
- Request-reply concept
- Event bus system
- Middleware support for brokers
- Load balanced requests (round-robin, random)
- Distributed timeout handling with fallback response
- Health monitoring, metrics & statistics
- Logging system with multiple configurable writable streams
- Fault tolerant
  
## Installation
```
$ npm install @weave-js/core --save
```

## Quick start

This example shows you how to create a `math` service with an `add` action which can add two numbers.

```js
const { Weave } = require('@weave-js/core')

const broker = Weave({
    logger: {
        logLevel: 'debug'
    }
})

broker.createService({
    name: 'math',
    actions: {
        add(context) {
            return Number(context.params.a) + Number(context.params.b)
        }
    }
});

broker.start()
    .then(() => {
        // Call service
        broker.call('math.add', { a: 5, b: 3 })
            .then(result => console.log('5 + 3 =', result))
            .catch(error => console.error(`Something went wrong! ${error.message}`))
    })

```

## Sample applications

There are a number of sample applications available:

```javascript
    // todo
```


## Documentation
See [documentation](https://weave.fachwerk.io).

## Changelog
See [changelog.md](changelog.md).

## Roadmap
See [roadmap.md](roadmap.md).

## Documentation

Refer to the [Weave CLI documentation](https://weave.fachwerk.io) for more details.

## License

Copyright (c) 2019 by Fachwerk Software

Licensed under the [MIT license](LICENSE).