import ContextMenu from "./main.vue";
import { getInstance } from "vue-crud/utils";

const instance = getInstance(ContextMenu);
instance.$mount();
document.body.appendChild(instance.$el);
ContextMenu.install = (Vue) => {
  Vue.component(ContextMenu.name, ContextMenu);

  if (!Vue.prototype.$crud) {
    Vue.prototype.$crud = {};
  }
  Vue.prototype.$crud.openContextMenu = instance.open;
};
export default ContextMenu;