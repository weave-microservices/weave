<template>
    <div>
        <div class="card events-card">
          <header class="card-header">
            <p class="card-header-title">Services</p>
            <a href="#" class="card-header-icon" aria-label="more options">
              <span class="icon">
                <i class="fa fa-angle-down" aria-hidden="true"></i>
              </span>
            </a>
          </header>

          <div class="card-table">
            <div class="content">
                <b-table :data="services">
                    <template slot-scope="props">
                        <b-table-column field="name" label="Service name" sortable>
                            {{ props.row.name }}
                        </b-table-column>

                        <b-table-column field="version" label="Version" sortable>
                            {{ props.row.version }}
                        </b-table-column>

                        <b-table-column field="actions" label="Actions" sortable>
                            {{ props.row.actions }}
                        </b-table-column>

                        <b-table-column field="events" label="Events" sortable>
                            {{ props.row.events }}
                        </b-table-column>

                        <b-table-column field="nodes" label="Nodes" sortable>
                            {{ props.row.nodes.length }}
                        </b-table-column>

                        <b-table-column field="isAvailable" label="Is available" sortable>
                             {{ props.row.isAvailable }}
                        </b-table-column>

                    </template>
                </b-table>
            </div>
          </div>
          <footer class="card-footer">
            <a href="#" class="card-footer-item">View All</a>
          </footer>
        </div>
        <!-- <table>
            <thead>
                <th>Action name</th>
                <th>Nodes</th>
                <th>State</th>
                <th>Cached fields</th>
                <th>Params</th>
            </thead>
            <tbody>
                <tr v-for="action in actions" :key="action.name">
                    <td>{{action}}</td>
                    <td>{{action.endpoints.length}}</td>
                    <td>{{action.hasAvailable}}</td>
                    <td>{{action.action.cache}}</td>
                    <td>{{action.action && action.action.params ? Object.keys(action.action.params).join(', ') : ''}}</td>
                </tr>
            </tbody>
        </table> -->
        <!-- <ul>
            <li v-for="service in services" :key="service.name">
                {{service.name}}
            </li>
        </ul> -->
    </div>
    <!-- <div class="about">
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
        <ul>
            <li v-for="service in services" :key="service.name">
                {{service.name}}
            </li>
        </ul>
    </div> -->
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
        this.$socket.emit("call", { actionName: "wlm.getServices" }, (error, data) => {
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