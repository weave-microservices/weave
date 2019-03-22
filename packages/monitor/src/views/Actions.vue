<template>
    <div>
        <div class="card events-card">
          <header class="card-header">
            <p class="card-header-title">Actions</p>
            <a href="#" class="card-header-icon" aria-label="more options">
              <span class="icon">
                <i class="fa fa-angle-down" aria-hidden="true"></i>
              </span>
            </a>
          </header>

          <div class="card-table">
            <div class="content">
                <b-table :data="actions">
                    <template slot-scope="props">
                        <b-table-column field="name" label="Action name" sortable>
                            {{ props.row.name }}
                        </b-table-column>

                        <b-table-column field="endpoints" label="Nodes" sortable>
                            {{ props.row.endpoints.length }}
                        </b-table-column>

                        <b-table-column field="hasAvailable" label="Has available" sortable>
                            {{ props.row.hasAvailable }}
                        </b-table-column>

                        <b-table-column field="action" label="Parameters" sortable>
                             {{props.row.action && props.row.action.params ? Object.keys(props.row.action.params).join(', ') : ''}}
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
            this.$socket.emit("call", { actionName: "wlm.getActions" }, (error, data) => {
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