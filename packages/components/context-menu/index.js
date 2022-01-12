import ContextMenu from "./main.vue";
import { getInstance } from "vue-crud/utils";
import { contextMenu } from "vue-crud/directives";

const instance = getInstance(ContextMenu);
instance.$mount();
document.body.appendChild(instance.$el);
ContextMenu.install = function (Vue) {
  Vue.component(this.name, this);
  if (!Vue.prototype.$crud) {
    Vue.prototype.$crud = {};
  }
  Vue.prototype.$openContextMenu = instance.open
  Vue.prototype.$crud.openContextMenu = instance.open;
  Vue.directive("contextmenu", contextMenu);
  ContextMenu.instance = instance
};
export default ContextMenu;