import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueSocketIO from 'vue-socket.io'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

Vue.use(Buefy)

Vue.config.productionTip = false

Vue.use(new VueSocketIO({
    debug: false,
    connection: '192.168.178.28:4445', // window.location.host,
    vuex: {
        store,
        actionPrefix: 'SOCKET_',
        mutationPrefix: 'SOCKET_'
    }
}))

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
