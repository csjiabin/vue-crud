
import Dialog from "./main.vue";
Dialog.install = function (Vue) {
  Vue.component(this.name, this);
}
export default Dialog;