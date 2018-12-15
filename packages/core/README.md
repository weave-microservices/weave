<img src="../../Logo.png" width="400">

[![NPM Version](https://img.shields.io/npm/v/@weave-js/core.svg)](https://www.npmjs.com/package/@weave-js/core)
[![CircleCI](https://circleci.com/gh/fachw3rk/weave/tree/master.svg?style=svg)](https://circleci.com/gh/fachw3rk/weave/tree/master)
[![Maintainability](https://api.codeclimate.com/v1/badges/cb59174696fd9021813a/maintainability)](https://codeclimate.com/github/fachw3rk/weave/maintainability) [![Dependencies](https://david-dm.org/fachw3rk/weave.svg)](https://david-dm.org/fachw3rk/weave) [![Downloads](https://img.shields.io/npm/dt/@weave-js/core.svg)](https://www.npmjs.com/package/@weave-js/core)
# Weave

Weave is a fast and easy to use  microservice framework for NodeJS (>= v6.x).


# Features

- No master/leader node
- Pluggable transporters (NATS, Redis, TCP)
- Automatic service discovery
- Multiple services per node
- Service mixins
- Request-reply concept
- Event bus system
- Middleware support for brokers
- Load balanced requests (round-robin, random)
- Distributed timeout handling with fallback response
- Health monitoring, metrics & statistics
- Fault tolerant
  
# Installation
```
$ npm install @weave-js/core --save
```

# Quick start
This example shows you how to create a small service with an `add` action which can add two numbers.
```js
const { Weave } = require('@weave-js/core')

let broker = Weave({ logLevel: 'debug' })

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

# Sample applications

There are a number of sample applications available:

```javascript
    // todo
```


# Documentation
See [documentation](https://weave.fachwerk.io).

# Changelog
See [changelog.md](changelog.md).

# Roadmap
See [roadmap.md](roadmap.md).

# License
The weave framework is available under the [MIT license](https://tldrlegal.com/license/mit-license).

# Contact
Copyright (c) 2018 by Fachwerk Software

