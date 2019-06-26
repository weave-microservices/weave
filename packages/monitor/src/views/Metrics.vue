<template>
  <div class="home">
      <!-- {{running}}
<br>
<br>
      {{stopped}} -->
    <metrics-List :metrics="metrics" v-if="metrics.length > 0"></metrics-List>
    <p v-else>Waiting for metrics...</p>
  </div>
</template>

<script>

import MetricsList from '../components/MetricsList.vue'
// @ is an alias to /sr
export default {
 name: "metrics",
 components: {
     MetricsList
 },
  sockets: {
    'tracing.trace.span.started': function(data) {
      this.running.push(data)
    },
    'tracing.trace.span.finished': function(data) {
      this.stopped.push(data)
    }
  },
  computed: {
    metrics () {
        const resultItem = item => {
            return {
                id: item.data.id,
                requestId: item.data.requestId,
                startTime: item.data.startTime,
                name: item.data.action.name,
                nodeId: item.data.nodeId,
                level: item.data.level,
                subRequests: item.subRequests,
                stopTime: item.stopTime,
                isPending: item.isPending
            }
        }

    const getSubRequestsRecursive = (item, level) => {
        const stopEvent = this.stopped.find(ev => {
            return ev.data.id === item.data.id
        })
        console.log(stopEvent)
        if (stopEvent) {
            item.stopTime = stopEvent.data.stopTime
            item.isPending = false
        } else {
            item.isPending = true
        }
        const subRequests = this.running.filter(i => i.data.parentId === item.data.id && i.data.level === level)
            .sort((a, b) => {
                if (a.data.startTime > b.data.startTime) return 1
                if (a.data.startTime < b.data.startTime) return -1
                return 0
            })
        if (subRequests.length > 0) {
            item.subRequests = subRequests.map(req => {
                return getSubRequestsRecursive(req, req.data.level + 1)
            })
             .map(item => resultItem(item))
            return item
        } else {
            item.subRequests = null
            return item
        }
    }

    const topLevelRequests = this.running
        .filter(request => request.data.level === 0)
        .map(item => getSubRequestsRecursive(item, item.data.level + 1))
        .map(item => resultItem(item))

      return topLevelRequests
    }
  },
  data() {
    return {
      running: [],
      stopped: []
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
    // this.getNodes();
  }
};
</script>
<style>
  

  /* .card .header .caption {
    font-weight: bold;
    text-transform: uppercase;
    text-align: left;
    padding: 10px;
    font-size: 12px;
  }

  .card .body {
    padding: 0 10px;
    text-align: left;
  } */

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