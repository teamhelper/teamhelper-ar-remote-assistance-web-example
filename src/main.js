import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.config.productionTip = false
Vue.use(ElementUI)
import 'thmkit/packages/lib/common/index.scss'
Vue.prototype.$THMKit = new Vue()
new Vue({
  render: h => h(App),
}).$mount('#app')
