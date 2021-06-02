import Vue from "vue";
import App from "./App.vue";
import "./element";
import VueCrud from "vue-crud";
Vue.config.productionTip = false;
Vue.use(VueCrud);
new Vue({
  render: (h) => h(App),
}).$mount("#app");
