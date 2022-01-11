import Vue from "vue";
import App from "./App.vue";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './crud.jsx'
Vue.use(ElementUI, { size: 'small' });

new Vue({
  render: (h) => h(App),
}).$mount("#app");
