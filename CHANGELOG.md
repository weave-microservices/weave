<a name="0.3.0"></a>
# [0.3.0]() (2018-02-05)

# New
NATS transporter

## Reconnect lost nodes
If a node1 get heartbeats from a actually disconnected node2. Node1 will send a discovery request to get the current infos from node2 and reconnect it.

# Fixed

## Cleanup for TCP Transporter

Old TCP-Mesh module removed.

--------------------------------------------------
<a name="0.2.19"></a>
# [0.2.19]() (2018-02-05)

# New

## Reconnect lost nodes
If a node1 get heartbeats from a actually disconnected node2. Node1 will send a discovery request to get the current infos from node2 and reconnect it.

# Fixed

## Cleanup for TCP Transporter

Old TCP-Mesh module removed.

--------------------------------------------------
<a name="0.2.18"></a>
# [0.2.19]() (2018-02-05)

# New

# Fixed

Fixed metrics finish method.

--------------------------------------------------

<a name="0.2.18"></a>
# [0.2.18]() (2018-02-05)

# New

# Fixed

Fixed metrics for action calls.

--------------------------------------------------
<a name="0.2.17"></a>
# [0.2.17]() (2018-01-28)

# New

## Add new service setting for private services.

If you set the property $private to true, the service is only reachable from the local node.

```js
module.exports = {
    name: 'math',
    mixins: [TestMixin],
    settings: {
        $private: true
    },
    actions: {
        add: {
            params: {
                a: { type: 'number' },
                b: { type: 'number' }
            },
            handler({ params }) {
                return params.a + params.b;
            }
        }
    }
}
```

## Add new internal action $node.list

List all connected nodes.

```js
[Node {
    id: 'testnode',
    local: true,
    client: {
        type: 'nodejs',
        version: '0.2.17',
        langVersion: 'v8.7.0'
    },
    cpu: null,
    lastHeartbeatTime: 1517162496548,
    isAvailable: true,
    services: null,
    events: null,
    IPList: ['192.168.178.21', '192.168.99.1']
} ]
```

## Add new internal action $node.actions

List all actions.

```js
[{
    name: '$node.services',
    hasAvailable: true,
    hasLocal: true,
    count: 1,
    action: {
        name: '$node.services',
        version: undefined
    }
},
{
    name: '$node.actions',
    hasAvailable: true,
    hasLocal: true,
    count: 1,
    action: {
        name: '$node.actions',
        version: undefined
    }
}]
```

# Fixed

Internal registry errors.

--------------------------------------------------
<a name="0.2.16"></a>
# [0.2.16]() (2018-01-22)

# New

## Add new cache features
In action cache, you now have the possibility to override the TTL. 

```js
module.exports = {
    name: 'example',
    actions: {
        show: {
            cache: {
                keys: ['name', 'site'],
                ttl: 5  // Set ttl to 5ms.
            }
        }
    }
}
```

--------------------------------------------------

<a name="0.2.15"></a>
# [0.2.15]() (2018-01-21)

# New

## Project runner script
There is a new weave project runner script in the bin folder. You can use it if you want to create small repositories for services. In this case you needn't to create a weave instance with options. Just create a weave.config.js or weave.config.json file in the root of repository, fill it with your options and call the weave-runner within the NPM scripts. As an other solution you can put it to the environment variables instead of putting options to file.


Example to start all services from the `services` folder.

```bash
$ weave-runner services
```


Example weave.config.js file with a REDIS transport, placed in the root of your project.

```js
const Weave = require('weave-core')

module.exports = {
    logLevel: 'debug',
    cacher: true,
    metrics: false,
    requestTimeout: 2000,
    transport: Weave.transports.Redis({
        host: process.env['REDIS_HOST']
    })
}

```

--------------------------------------------------

<a name="0.2.14"></a>
# [0.2.14]() (2018-01-20)

# New

## Add Changelog to project
