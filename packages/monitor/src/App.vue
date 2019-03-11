<template>
    <div id="app">
        <header>
            <div>
                <img src="@/assets/Logo.png" id="logo">
            </div>
            <div id="nav">
                <router-link to="/">Nodes</router-link> |
                <router-link to="/services">Services</router-link> |
                <router-link to="/actions">Actions</router-link> |
                <router-link to="/events">Events</router-link> |
                <router-link to="/metrics">Metrics</router-link>
            </div>
        </header>
        <div id="content">
            <router-view/>
        </div>
    </div>
</template>

<style>
body {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

header {
    display: flex;
    justify-content: space-between;
}

#logo {
    width: 250px;
}
#nav {
  padding: 30px;
}

#nav a {
    font-weight: bold;
    color: #2c3e50;
}

#nav a.router-link-exact-active {
    color: #008ad5;
}

#content {
    text-align: center;
}

table {
    width: 100%;    
    border-collapse: collapse;
}

table, th, td {
    border: #263e52 solid 1px;
}
</style>
