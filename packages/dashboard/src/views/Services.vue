<template>
  <div class="about">
      <ul>
          <li v-for="service in services" :key="service.name">
              {{service.name}}
          </li>
      </ul>
  </div>
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
      this.$socket.emit("call", { actionName: "weave-dashboard.getServices" },
        (error, data) => {
          this.services = data;
        }
      );
    }
  },
  mounted() {
        this.getServices();
  }
};
</script>