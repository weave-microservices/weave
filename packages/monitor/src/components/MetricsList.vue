<template>
    <div class="metrics-container">
      <div class="metrics" :class="{ 'is-pending': metric.isPending }" v-for="metric in metrics" :key="metric.id">
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
    background: #dfdfdf;
    border: #42b983 solid 1px;
    margin: 5px;
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
</style>
