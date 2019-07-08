import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
    {
        path: '/',
        name: 'nodes',
        component: () => import(/* webpackChunkName: "about" */ './views/Nodes.vue')
    },
    {
        path: '/services',
        name: 'services',
        component: () => import(/* webpackChunkName: "about" */ './views/Services.vue')
    },
    {
        path: '/actions',
        name: 'actions',
        component: () => import(/* webpackChunkName: "about" */ './views/Actions.vue')
    },
    {
        path: '/events',
        name: 'events',
        component: () => import(/* webpackChunkName: "about" */ './views/Events.vue')
    },
    {
        path: '/tracing',
        name: 'tracing',
        component: () => import(/* webpackChunkName: "about" */ './views/Tracing.vue')
    }
    ]
})
