import Vnodes from "./main.vue";
Vnodes.install = (Vue) => {
  Vue.component(Vnodes.name, Vnodes);
};
export default Vnodes;