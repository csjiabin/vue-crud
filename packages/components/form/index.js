
import Form from "./main.vue";

import { getInstance } from "vue-crud/utils";


// instance.$mount();
// document.body.appendChild(instance.$el);
Form.install = function (Vue) {
  const instance = getInstance(Form, Vue);
  Vue.component(this.name, this);
  console.log(instance);
  if (!Vue.prototype.$crud) {
    Vue.prototype.$crud = {};
  }
  Vue.prototype.$openForm = instance.open
  Vue.prototype.$crud.openForm = instance.open;
  Form.instance = instance
};
export default Form;