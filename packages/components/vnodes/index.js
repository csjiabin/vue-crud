import Vnodes from "./main.vue";
Vnodes.install = function (Vue) {
  Vue.component(this.name, this);
}
export default Vnodes;