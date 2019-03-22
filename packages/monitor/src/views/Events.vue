<template>
    <div>
        <div class="card events-card">
          <header class="card-header">
            <p class="card-header-title">Events</p>
            <a href="#" class="card-header-icon" aria-label="more options">
              <span class="icon">
                <i class="fa fa-angle-down" aria-hidden="true"></i>
              </span>
            </a>
          </header>

          <div class="card-table">
            <div class="content">
                <b-table :data="events">
                    <template slot-scope="props">
                        <b-table-column field="name" label="Event name" sortable>
                            {{ props.row.name }}
                        </b-table-column>
                        <b-table-column field="groupName" label="Group name" sortable>
                            {{ props.row.groupName }}
                        </b-table-column>
                        <b-table-column field="endpoints" label="Nodes" sortable>
                            {{ props.row.endpoints.length }}
                        </b-table-column>

                        <b-table-column field="hasAvailable" label="Has available" sortable>
                            {{ props.row.hasAvailable }}
                        </b-table-column>
                    </template>
                </b-table>
            </div>
          </div>
          <footer class="card-footer">
            <a href="#" class="card-footer-item">View All</a>
          </footer>
        </div>
       
    </div>
    <!-- <div class="about">
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