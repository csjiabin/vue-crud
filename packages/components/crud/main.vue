<template>
  <div :class="['v-crud', { 'is-border': border }]" v-on="$listeners">
    <slot />
  </div>
</template>
<script>
import { Emitter } from "vue-crud/mixins";
import { deepMerge } from "vue-crud/utils";

export default {
  name: "v-crud",
  mixins: [Emitter],
  props: {
    // 是否带有边框
    border: Boolean,
    // 删除钩子 { selection, { next } }
    onDelete: Function,
    // 刷新钩子 { params, { next, done, render } }
    onRefresh: Function,
  },
  provide() {
    return {
      crud: this,
    };
  },
  data() {
    return {
      service: null,
      loading: false,
      selection: [],
      test: {
        refreshRd: null,
        sortLock: false,
        process: false,
      },
      permission: {
        update: true,
        page: true,
        info: true,
        list: true,
        add: true,
        delete: true,
      },
      params: {
        page: 1,
        size: 20,
      },
      // Config data
      dict: {
        api: {
          list: "list",
          add: "add",
          update: "update",
          delete: "delete",
          info: "info",
          page: "page",
        },
        pagination: {
          page: "page",
          size: "size",
        },
        search: {
          keyWord: "keyWord",
          query: "query",
        },
        sort: {
          order: "order",
          prop: "prop",
        },
        label: {
          refresh: "刷新",
          add: "新增",
          delete: "删除",
          multiDelete: "删除",
          update: "编辑",
          refresh: "刷新",
          advSearch: "高级搜索",
          saveButtonText: "保存",
          closeButtonText: "关闭",
        },
      },
      table: {
        "context-menu": true,
        align: "left",
      },
      fn: {
        permission: null,
      },
      style: {
        refreshBtn: {},
        addBtn: {},
        multiDeleteBtn: {},
        advBtn: {},
        editBtn: {},
        deleteBtn: {},
        saveBtn: {},
        closeBtn: {},
        filterSearchBtn: {},
      },
    };
  },
  created() {
    const { options } = this.$crud;
    // console.log(options);
    // 合并全局配置
    deepMerge(this, options);
    this.$on("table.selection-change", this.tableSelectionChange);
    this.$once("hook:beforeDestroy", () => {
      this.$off("table.selection-change", this.tableSelectionChange);
    });
  },
  mounted() {},
  methods: {
    tableSelectionChange({ selection }) {
      this.selection = selection;
    },
    // 重新渲染布局
    doLayout() {
      this.broadcast("v-table", "resize");
    },
  },
};
</script>
<style lang="scss">
.v-crud {
  // display: flex;
  // flex-direction: column;
  height: 100%;
  position: relative;
  padding: 10px;
  box-sizing: border-box;
  background-color: #fff;
  overflow: hidden;

  &.is-border {
    border: 1px solid #eee;
  }

  .el-input-number {
    &__decrease,
    &__increase {
      border: 0;
      background-color: transparent;
    }
  }

  & > .el-row {
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 5px;
    margin-bottom: 0;
    min-height: 33px;

    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(144, 147, 153, 0.3);
      border-radius: 5px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    & + .el-row {
      margin-top: 5px;
    }
  }
}
</style>
