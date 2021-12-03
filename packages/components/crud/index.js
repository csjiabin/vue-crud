import Crud from "./main.vue";
Crud.install = (Vue) => {
  Vue.component(Crud.name, Crud);
};
export default Crud;