<img src="/assets/Logo.png" width="400">

# Weave

Weave is a fast and easy to use  microservice framework for NodeJS (>= v6.x).


# Features

- Service mixins
- Multiple services per node
- Request-reply concept
- Event bus system
- Supports middlewares
- Pluggable transporters (NATS, Redis)
- Automatic service discovery
- Load balanced requests (round-robin, random)
- No master/leader node
- Distributed timeout handling with fallback response
- Health monitoring, metrics & statistics

# Installation
```
$ npm install weave-core --save
```

# Quick start
This example shows you how to create a small service with an `add` action which can add two numbers.
```js
const Weave = require('weave-core');

let broker = Weave({ logLevel: 'debug' });

broker.createService({
    name: 'math',
    actions: {
        add(ctx) {
            return Number(ctx.params.a) + Number(ctx.params.b);
        }
    }
});

broker.start();

// Call service
broker.call('math.add', { a: 5, b: 3 })
    .then(result => console.log('5 + 3 =', result))
    .catch(error => console.error(`Something went wrong! ${error.message}`));
```

# Sample applications

There are a number of sample applications available:

```javascript
    // todo
```


# Documentation
Comming soon
# Changelog
See [changelog.md](changelog.md).

# Roadmap
See [roadmap.md](roadmap.md).

# License
The weave framework is available under the [MIT license](https://tldrlegal.com/license/mit-license).

# Contact
Copyright (c) 2018 by Fachwerk
