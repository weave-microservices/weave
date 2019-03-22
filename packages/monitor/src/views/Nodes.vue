<template>
  <div>
    <section class="hero is-info welcome is-small">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">Welcome to Weave Landscape Monitor</h1>
          <h2 class="subtitle">Version {{version}}</h2>
        </div>
      </div>
    </section>
    <section class="info-tiles">
      <div class="tile is-ancestor has-text-centered">
        <div class="tile is-parent">
          <article class="tile is-child box">
            <p class="title">{{nodes.filter(node => node.isAvailable).length}}</p>
            <p class="subtitle">Nodes</p>
          </article>
        </div>
        <div class="tile is-parent">
          <article class="tile is-child box">
            <p class="title">{{nodes.filter(node => !node.isAvailable).length}}</p>
            <p class="subtitle">Disconnected Nodes</p>
          </article>
        </div>
        <div class="tile is-parent">
          <article class="tile is-child box">
            <p class="title">3.4k</p>
            <p class="subtitle">Open Orders</p>
          </article>
        </div>
        <div class="tile is-parent">
          <article class="tile is-child box">
            <p class="title">19</p>
            <p class="subtitle">Exceptions</p>
          </article>
        </div>
      </div>
    </section>


        <div class="card events-card">
          <header class="card-header">
            <p class="card-header-title">Nodes</p>
            <a href="#" class="card-header-icon" aria-label="more options">
              <span class="icon">
                <i class="fa fa-angle-down" aria-hidden="true"></i>
              </span>
            </a>
          </header>

          <div class="card-table">
            <div class="content">
              <table class="table is-fullwidth is-striped">
                <tbody>
                  <tr v-for="node in nodes" :key="node.id">
                    <td width="5%">
                      <i class="fa fa-bell-o"></i>
                    </td>
                    <td>{{node.id}}</td>
                    <td>
                        <b-tag v-if="node.isAvailable" type="is-info">Connected</b-tag>
                        <b-tag v-if="!node.isAvailable" type="is-danger">Disconnected</b-tag>
                    </td>
                    <td>
                       <div class="control">
                          <b-taglist attached>
                              <b-tag type="is-dark">Services</b-tag>
                              <b-tag type="is-success">{{ node.serviceCount }}</b-tag>
                          </b-taglist>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <footer class="card-footer">
            <a href="#" class="card-footer-item">View All</a>
          </footer>
        </div>
      
  </div>
  <!-- <div class="home">

    <p>
      Connected nodes: 
    </p>
    <p>
      Disconnected nodes: {{nodes.filter(node => !node.isAvailable).length}}
    </p>
    <div class="card-container">
      <div class="card" :class="{ 'up': node.isAvailable, 'down': !node.isAvailable }" v-for="node in nodes" :key="node.id">
        <div class="header">
          <div class="caption">
            {{node.id}}
          </div>
        </div>
        <div class="body">
          Services: {{ node.serviceCount }}
          <span v-if="node.offlineTime !== null">
            {{node.offlineTime}}
          </span>
        </div>

      </div>
    </div>
  </div>-->
</template>

<script>
// @ is an alias to /sr
export default {
  name: "nodes",
  sockets: {
    '$node.connected': function(data) {
      this.getNodes()
    },
    '$node.disconnected': function(data) {
      this.getNodes()
    },
    '$node.removed': function(data) {
      this.getNodes()
    }
  },
  data() {
    return {
      nodes: [],
      version: JSON.parse(unescape(process.env.PACKAGE_JSON || '%7Bversion%3A0%7D')).version,
      columns: [
        {
          field: "id",
          label: "ID",
          width: "40",
          numeric: true
        },
        {
          field: "first_name",
          label: "First Name"
        },
        {
          field: "last_name",
          label: "Last Name"
        },
        {
          field: "date",
          label: "Date",
          centered: true
        },
        {
          field: "gender",
          label: "Gender"
        }
      ]
    };
  },
  methods: {
    getNodes() {
      this.$socket.emit(
        "call",
        { actionName: "wlm.getNodes" },
        (error, data) => {
          this.nodes = data.sort((a, b) => {
            if (a.id > b.id) return 1;
            if (a.id < b.id) return -1;
            return 0;
          });
        }
      );
    }
  },
  mounted() {
    this.getNodes();
  }
};
</script>
<style>

.up {
  background: #42b983;
  border: #42b983 solid 1px;
}

.down {
  background: #ac0000;
  border: #ac0000 solid 1px;
}

.state-batch {
}
</style>