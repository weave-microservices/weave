<template>
  <div class="home">

    <p>
      Connected nodes: {{nodes.filter(node => node.isAvailable).length}}
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
  </div>
</template>

<script>
// @ is an alias to /sr
export default {
 name: "nodes",
  sockets: {
    '$node.connected': function(data) {
        this.getNodes();
    },
    '$node.disconnected': function(data) {
        this.getNodes();
    }
  },
  data() {
    return {
      nodes: []
    };
  },
  methods: {
    getNodes() {
      this.$socket.emit("call", { actionName: "wlm.getNodes" },
        (error, data) => {
          this.nodes = data.sort((a, b) => {
            if (a.id > b.id) return 1
            if (a.id < b.id) return -1
            return 0
        })
      })
    }
  },
  mounted() {
        this.getNodes();
  }
};
</script>
<style>
  .card-container {
    display: flex;
    flex-wrap: wrap;
  }
  .card {
    min-width: 250px;
    background: #dfdfdf;
    border: #42b983 solid 1px;
    margin: 5px;
    border-radius: 5px;
  }

  .card .header {
    align-content: flex-start;
    
  }

  .card .header .caption {
    font-weight: bold;
    text-transform: uppercase;
    text-align: left;
    padding: 10px;
    font-size: 12px;
  }

  .card .body {
    padding: 0 10px;
    text-align: left;
  }

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