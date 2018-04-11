![weave logo](docs/assets/logo.png)

# Weave

Weave is a fast and easy to use  microservice framework for NodeJS (>= v6.x).



# What's included?

- service mixins
- multiple services per node
- request-reply concept
- event bus system
- supports middlewares
- pluggable transporters (NATS, Redis)
- auto discovery services
- load balanced requests (round-robin, random)
- all nodes are equal, no master/leader node
- distributed timeout handling with fallback response
- health monitoring, metrics & statistics
- supports versioned services (run different versions of the service)


# Installation
```
$ npm install weave-core --save
```

# Create your first microservice
This example shows you how to create a small service with an `add` action which can add two numbers.
```js
const Weave = require("weave-core");

let broker = Weave({ logLevel: 'debug' });

broker.createService({
    name: "math",
    actions: {
        add(ctx) {
            return Number(ctx.params.a) + Number(ctx.params.b);
        }
    }
});

broker.start();

// Call service
broker.call("math.add", { a: 5, b: 3 })
    .then(res => console.log("5 + 3 =", res))
    .catch(err => console.error(`Something went wrong! ${err.message}`));
```

# Documentation
Comming soon
# Changelog
See [CHANGELOG.md](CHANGELOG.md).

# Roadmap
See [ROADMAP.md](ROADMAP.md).

# License
The weave framework is available under the [MIT license](https://tldrlegal.com/license/mit-license).

# Contact
Copyright (c) 2018 by Fachwerk