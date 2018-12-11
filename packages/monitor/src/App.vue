<template>
    <div id="app">
    <div id="nav">
        <router-link to="/">Nodes</router-link> |
        <router-link to="/services">Services</router-link> |
        <router-link to="/actions">Actions</router-link> |
        <router-link to="/metrics">Metrics</router-link>
    </div>
    <router-view/>
    </div>
</template>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
    font-weight: bold;
    color: #2c3e50;
}

#nav a.router-link-exact-active {
    color: #42b983;
}

table {
    width: 100%;    
    border-collapse: collapse;
}

table, th, td {
    border: #263e52 solid 1px;
}
</style>
