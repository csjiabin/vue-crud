import Vue from "vue";
import VueCrud from 'vue-crud'
Vue.use(VueCrud, {
  dict: {
    sort: {
      prop: "order",
      order: "sort",
    },
  },
  table: {
    // 'context-menu': false
    indexMethod(index, crud) {
      return index + 1 + (crud.params.page - 1) * crud.params.size;
    },
    empty(h){
      return (<div>empty</div>)
    }
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
