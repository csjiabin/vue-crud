
import Form from "./main.vue";

import { getInstance } from "vue-crud/utils";

Form.install = function (Vue) {
  const instance = getInstance(Form, Vue);
  instance.$mount();
  document.body.appendChild(instance.$el);
  Vue.component(this.name, this);
  if (!Vue.prototype.$crud) {
    Vue.prototype.$crud = {};
  }
  Vue.prototype.$openForm = instance.open
  Vue.prototype.$crud.openForm = instance.open;
  Form.instance = instance
};
export default Form;