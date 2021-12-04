<template>
  <div v-resize="calcMaxHeight">table</div>
</template>
<script lang="jsx">
import { Emitter } from "vue-crud/mixins";
import { resize } from "vue-crud/directives";

export default {
  name: "v-table",
  mixins: [Emitter],
  directives: {
    resize,
  },
  inject: ["crud"],
  props: {
    columns: {
      type: Array,
      required: true,
      default: () => [],
    },
    on: {
      type: Object,
      default: () => {
        return {};
      },
    },
    props: {
      type: Object,
      default: () => {
        return {};
      },
    },
    // 是否自动计算表格高度
    autoHeight: {
      type: Boolean,
      default: true,
    },
    // 开启右键菜单
    contextMenu: {
      type: [Boolean, Array],
      default: undefined,
    },
    // 排序刷新
    sortRefresh: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      maxHeight: null,
      data: [],
      emit: {},
    };
  },
  created() {
    // 获取默认排序
    const { order, prop } = this.props["default-sort"] || {};

    if (order && prop) {
      this.crud.params.order = order === "descending" ? "desc" : "asc";
      this.crud.params.prop = prop;
    }

    // 事件监听
    this.$on("crud.refresh", ({ list }) => {
      this.data = list;
    });
  },
  methods: {
    calcMaxHeight() {
      console.log(1);
    },
  },
};
</script>
