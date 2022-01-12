
import Table from "./main.vue";
Table.install = function (Vue) {
  Vue.component(this.name, this);
}
export default Table;