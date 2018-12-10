import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    nodes: [],
    services: [],
    metrics: []
  },
  mutations: {
    'SOCKET_$services.changed' () {
      console.log('mutation')
    }
  },
  actions: {
    'SOCKET_$services.changed' ({ commit, dispatch}) {
      dispatch('getNodes')
    },
    'getNodes' ({ commit, dispatch}) {
      console.log('getNodes')
      const v = Vue
      console.log(v)

      // commit('setNodes')
    }
  }
})
