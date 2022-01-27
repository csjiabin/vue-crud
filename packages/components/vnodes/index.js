import Vnodes from "./main.vue";
export { renderNode } from "./utils";
Vnodes.install = function (Vue) {
  Vue.component(this.name, this);
}
export default Vnodes;