import vnode from "./main.vue";
export { renderNode } from "./utils";
vnode.install = function (Vue) {
  Vue.component(this.name, this);
}
export default vnode;