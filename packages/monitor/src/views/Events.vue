<template>
    <div class="about">
        <table>
            <thead>
                <th>Event name</th>
                <th>Nodes</th>
                <th>State</th>
            </thead>
            <tbody>
                <tr v-for="event in events" :key="event.name">
                    <td>{{event.name}}</td>
                    <td>{{event.endpoints}}</td>
                    <td>{{event.hasAvailable}}</td>
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
    name: "actions",
    sockets: {
        '$services.changed': function(data) {
            this.getEvents()
        },
        '$node.connected': function(data) {
            this.getEvents()
        },
        '$node.disconnected': function(data) {
            this.getEvents()
        }
    },
    data() {
        return {
            events: []
        }
    },
    methods: {
        getEvents() {
            this.$socket.emit("call", { actionName: "wlm.getEvents" }, (error, data) => {
                this.events = data.sort((a, b) => {
                    if (a.name > b.name) return 1
                    if (a.name < b.name) return -1
                    return 0
                })
            })
        }
    },
    mounted() {
        this.getEvents()
    }
}
</script>