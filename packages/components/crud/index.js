import Crud from "./main.vue";
Crud.install = function (Vue) {
  Vue.component(this.name, this);
}
export default Crud;