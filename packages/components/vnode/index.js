import Vnode from "./main.vue";
export { renderNode } from "./utils";
Vnode.install = function (Vue) {
  Vue.component(this.name, this);
}
export default Vnode;