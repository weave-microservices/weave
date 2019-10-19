# @weave-js/cli

> REPL module for weave microservice framework

## Installation

```
npm install @weave-js/repl
```

## Usage

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

await broker.start()
await broker.repl()
```

## Documentation

Refer to the [Weave REPL documentation](https://weave.fachwerk.io) for more details.

## License

Copyright (c) 2019 by Fachwerk Software

Licensed under the [MIT license](LICENSE).