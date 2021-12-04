import Vue from "vue";
import App from "./App.vue";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueCrud from 'vue-crud'
Vue.use(ElementUI);
Vue.use(VueCrud, {
  dict: {
    sort: {
      prop: "order",
      order: "sort",
    },
  },
  table: {
    // 'context-menu': false
    indexMethod: (index, crud) => {
      return index + 1 + (crud.params.page - 1) * crud.params.size;
    },
  },
  params: {
    page: 1,
    size: 20,
  },
  style: {
    refreshBtn: {},
    addBtn: {},
    multiDeleteBtn: {},
    advBtn: {},
    editBtn: {
      type: "primary",
    },
    deleteBtn: {
      type: "danger",
    },
    saveBtn: {
      type: "primary",
    },
    closeBtn: {
      // type: ""
    },
    table: {
      size: "small",
      stripe: true,
    },
    tableOp: {
      // width: "200px"
    },
    filterSearchBtn: {
      icon: "el-icon-search",
    },
  },
});
new Vue({
  render: (h) => h(App),
}).$mount("#app");
