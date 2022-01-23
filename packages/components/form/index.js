
import Form from "./main.vue";
Form.install = function (Vue) {
  Vue.component(this.name, this);
}
export default Form;