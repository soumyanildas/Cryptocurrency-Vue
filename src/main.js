import Vue from 'vue'
import App from './App.vue'
import VueGoodTablePlugin from 'vue-good-table';
 
// import the styles 
import 'vue-good-table/dist/vue-good-table.css'
 
Vue.use(VueGoodTablePlugin);
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
