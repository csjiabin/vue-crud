
import AddBtn from "./main.vue";
AddBtn.install = function (Vue) {
  Vue.component(this.name, this);
}
export default AddBtn;