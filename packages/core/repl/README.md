# @weave-js/repl

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
        level: 'debug'
    }
})

broker.createService({
    name: 'math',
    actions: {
        add(context) {
            return Number(context.data.a) + Number(context.data.b)
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