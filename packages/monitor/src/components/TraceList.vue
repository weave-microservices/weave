<template>
    <div class="metrics-container">
       <transition-group name="list">
        <div class="metrics list-item" :class="{ 'is-pending': metric.isPending }" v-for="metric in metrics.reverse()" :key="metric.id">
            <div class="header">
              <div class="caption">
                {{metric.name}} @ {{metric.nodeId}}
              </div>
              <div class="execution-time">
                <span v-if="metric.stopTime">{{Math.floor(metric.stopTime - metric.startTime)}}ms</span>
              </div>
            </div>
            <metrics-list v-if="metric.subRequests" :metrics="metric.subRequests"></metrics-list>
        </div>
       </transition-group>
    </div>
</template>

<script>
export default {
  name: 'MetricsList',
  props: {
    metrics: Array
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.metrics-container {
    display: flex;
    flex-direction: column;
    flex-wrap:nowrap;
  }
  .metrics {
    background: #fff;
    border: #ff6f91 solid 1px;
    margin: 10px;
    border-radius: 5px;
  }

  .metrics .metrics {
    margin-left: 20px;
  }
  
  .is-pending {
    background: #ffef63;
  }

  .metrics .header {
    display: flex;
  }
  .metrics .header .caption {
    width: 50%;
    text-align: left; 
    margin: 10px;
  }

  .metrics .header .execution-time {
    width: 50%;
    text-align: right; 
    margin: 10px;
  }


  .card .header {
    align-content: flex-start;
  }

.list-enter-active, .list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
