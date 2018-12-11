<template>
    <div class="about">
        <table>
            <thead>
                <th>Service name</th>
                <th>Version</th>
                <th>Actions</th>
                <th>Events</th>
                <th>Nodes</th>
                <th>Available</th>
            </thead>
            <tbody>
                <tr v-for="service in services" :key="service.name">
                    <td>{{service.name}}</td>
                    <td>{{service.version}}</td>
                    <td>{{service.actions}}</td>
                    <td>{{service.events}}</td>
                    <td>{{service.nodes.length}}</td>
                    <td>{{service.isAvailable}}</td>
                </tr>
            </tbody>
        </table>
        <!-- <ul>
            <li v-for="service in services" :key="service.name">
                {{service.name}}
            </li>
        </ul> -->
    </div>
</template>
<script>
// @ is an alias to /src

export default {
    name: "services",
    sockets: {
        '$services.changed': function(data) {
            this.getServices();
        },
        '$node.connected': function(data) {
            this.getServices();
        },
        '$node.disconnected': function(data) {
            this.getServices();
        }
    },
    data() {
        return {
            services: []
        };
    },
    methods: {
    getServices() {
        this.$socket.emit("call", { actionName: "weave-dashboard.getServices" }, (error, data) => {
            const list = []
            data.map(service => {
                let item = list.find(i => {
                    return i.name === service.name
                })
                if (item) {
                    item.nodes.push({
                        nodeId: service.nodeId,
                        isAvailable: service.isAvailable
                    })
                } else {
                    item = Object.create(null)
                    item.name = service.name
                    item.version = service.version ? service.version : 1
                    item.isAvailable = service.isAvailable
                    item.actions = service.actions ? Object.keys(service.actions).length : 0
                    item.events = service.events ? Object.keys(service.events).length : 0
                    item.nodes = [{
                        nodeId: service.nodeId,
                        isAvailable: service.isAvailable
                    }]
                    list.push(item)
                }
            })

           this.services = list.sort((a, b) => {
                if (a.name > b.name) return 1
                if (a.name < b.name) return -1
                return 0
            })
        })
    }
  },
  mounted() {
        this.getServices();
  }
};
</script>