import Vue from "vue";
import App from "./App.vue";
import "./element";
import VueCrud from "~";
// import "../lib/vue-crud.css";
// import VueCrud from "../lib/vue-crud.umd.min";
Vue.config.productionTip = false;
Vue.use(VueCrud);
new Vue({
  render: (h) => h(App),
}).$mount("#app");
