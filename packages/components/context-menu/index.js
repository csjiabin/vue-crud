import ContextMenu from "./main.vue";
import { getInstance } from "vue-crud/utils";
import { contextMenu } from "vue-crud/directives";


ContextMenu.install = function (Vue) {
  const instance = getInstance(ContextMenu, Vue);
  instance.$mount();
  document.body.appendChild(instance.$el);
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