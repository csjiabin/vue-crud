import Pagination from './main.vue'
Pagination.install = function (Vue) {
  Vue.component(this.name, this);
}

export default Pagination