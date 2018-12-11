<template>
    <div class="about">
        <table>
            <thead>
                <th>Action name</th>
                <th>Nodes</th>
                <th>State</th>
                <th>Cached fields</th>
                <th>Params</th>
            </thead>
            <tbody>
                <tr v-for="action in actions" :key="action.name">
                    <td>{{action.name}}</td>
                    <td>{{action.endpoints.length}}</td>
                    <td>{{action.hasAvailable}}</td>
                    <td>{{action.action.cache}}</td>
                    <td>{{action.action && action.action.params ? Object.keys(action.action.params).join(', ') : ''}}</td>
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
            this.getActions()
        },
        '$node.connected': function(data) {
            this.getActions()
        },
        '$node.disconnected': function(data) {
            this.getActions()
        }
    },
    data() {
        return {
            actions: []
        };
    },
    methods: {
        getActions() {
            this.$socket.emit("call", { actionName: "weave-dashboard.getActions" }, (error, data) => {
                this.actions = data.sort((a, b) => {
                    if (a.name > b.name) return 1
                    if (a.name < b.name) return -1
                    return 0
                })
            })
        }
    },
    mounted() {
        this.getActions()
    }
}
</script>