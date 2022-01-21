<template>
  <div v-resize="calcMaxHeight" class="v-table">
    <div class="v-table__header" v-if="$slots.header">
      <slot name="header" />
    </div>
    <!--分页 -->
    <div
      class="v-table__pager"
      v-if="pagination && pagination.position == 'top'"
    >
      <v-pagination v-bind="pagerProps" />
    </div>
    <!--表格 -->
    <el-table ref="table" v-bind="tableProps" v-on="listeners">
      <v-vnodes :vnodes="renderColumns(columns)" />
      <slot slot="append" name="append" />
      <slot slot="empty" name="empty">
        <v-vnodes v-if="!emptyText" :vnodes="renderEmpty()" />
      </slot>
    </el-table>
    <!--分页 -->
    <div
      class="v-table__pager"
      v-if="pagination && pagination.position == 'bottom'"
    >
      <v-pagination v-bind="pagerProps" />
    </div>
    <div class="v-table__footer" v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </div>
</template>
<script lang="jsx">
import { resize } from "vue-crud/directives";
import { Emitter, Screen } from "vue-crud/mixins";
import { isString, isFunction, isEmpty, get } from "vue-crud/utils";

import VVnodes from "../vnodes";
import VPagination from "../pagination";

export default {
  name: "v-table",
  mixins: [Emitter, Screen],
  directives: {
    resize,
  },
  inject: ["crud"],
  components: {
    VVnodes,
    VPagination,
  },
  props: {
    columns: {
      type: Array,
      required: true,
      default: () => [],
    },
    on: {
      type: Object,
      default: () => ({}),
    },
    props: {
      type: Object,
      default: () => ({}),
    },
    // 是否自动计算表格高度
    autoHeight: {
      type: Boolean,
      default: true,
    },
    // 撑开高度
    fullHeight: {
      type: Boolean,
      default: false,
    },
    // 开启右键菜单
    contextMenu: [Boolean, Array],
    align: String,
    // 排序刷新
    sortRefresh: {
      type: Boolean,
      default: true,
    },
    // 分页器，参考配置项或 pagination 文档，空默认不展示 {props, on}
    pagination: {
      type: Object,
    },
  },

  data() {
    return {
      height: null,
      list: [],
      emit: {},
    };
  },
  computed: {
    response() {
      return this.crud.response;
    },
    emptyText() {
      return this.props["empty-text"] || this.props["emptyText"];
    },
    tableProps() {
      const { table = {} } = this.crud || {};
      let props = {
        emptyText: "",
      };
      if (isString(table.empty)) {
        props.emptyText = table.empty;
      }
      if (this.emptyText) {
        props.emptyText = this.emptyText;
      }
      if (this.autoHeight) {
        props.maxHeight = this.height + "px";
      }
      if (this.fullHeight) {
        props.height = this.height + "px";
      }
      return {
        data: this.list,
        ...this.props,
        ...props,
      };
    },
    listeners() {
      return {
        ...this.on,
        "sort-change": this.handleSortChange,
        "row-contextmenu": this.handleRowContextmenu,
      };
    },
    _align() {
      const { table = {} } = this.crud || {};
      return this.align || table.align;
    },
    pagerProps() {
      const { on = {}, props = {} } = this.pagination;
      return {
        on,
        props,
      };
    },
  },
  // watch: {
  // "response.list": {
  //   deep: true,
  //   handler(v) {
  //     if (!v) return;
  //     this.list = v;
  //   },
  // },
  // },
  created() {
    // 获取默认排序
    const { order, prop } = this.props["default-sort"] || {};
    const { params = {} } = this.crud || {};
    if (order && prop) {
      params.order = order === "descending" ? "desc" : "asc";
      params.prop = prop;
    }
    this.$on("crud.refresh", this.setList);
    this.$once("hook:beforeDestroy", () => {
      this.$off("crud.refresh", this.setList);
    });
  },
  mounted() {
    this.calcMaxHeight();
    this.bindMethods();
  },
  methods: {
    setList({ list }) {
      this.list = list;
    },
    // 计算表格最大高度
    calcMaxHeight() {
      if (!this.autoHeight && !this.fullHeight) return;
      this.$nextTick(() => {
        const el = this.crud?.$el;
        let { height = "" } = this.props || {};
        const { padding } = this.crud;
        if (!el) return;
        let h2 = el.clientHeight - (padding ?? 0) * 2;
        let rows = el.querySelectorAll(".el-row");
        let pager = el.querySelector(".v-table__pager");
        let header = el.querySelector(".v-table__header");
        let footer = el.querySelector(".v-table__footer");
        if (rows.length) {
          let h = 0;
          for (let i = 0; i < rows.length; i++) {
            h += rows[i].clientHeight;
          }
          h2 -= h;
        }
        if (pager) {
          h2 -= pager.clientHeight;
          console.log("pager", pager.clientHeight);
        }
        if (header) {
          h2 -= header.clientHeight;
          console.log("header", header.clientHeight);
        }
        if (footer) {
          h2 -= footer.clientHeight;
          console.log("footer", header.clientHeight);
        }
        let h1 = Number(height?.replace?.("px", ""));
        this.height = h1 > h2 ? h1 : h2;
      });
    },
    // 监听排序
    handleSortChange({ column, prop, order }) {
      if (this.sortRefresh) {
        if (order === "descending") {
          order = "desc";
        }

        if (order === "ascending") {
          order = "asc";
        }

        if (this.crud.test.sortLock) {
          this.crud.refresh({
            prop,
            order,
            page: 1,
          });
        }
      }
      this.on["sort-change"]?.({ column, prop, order });
    },
    // 右键菜单
    handleRowContextmenu(row, column, event) {
      const {
        refresh,
        rowEdit,
        rowDelete,
        getPermission,
        selection,
        table = {},
      } = this.crud;
      let btns = [
        "refresh",
        "check",
        "edit",
        "delete",
        "order-asc",
        "order-desc",
      ];
      this.on["row-contextmenu"]?.(row, column, event);

      // 配置
      const cm =
        isEmpty(this.contextMenu) && !isArray(this.contextMenu)
          ? table["context-menu"]
          : this.contextMenu;
      if (cm && isArray(cm)) {
        btns = cm || [];
      }
      let enable = btns.length > 0;
      if (!enable) return;
      // 右键菜单处理
      let list = btns.map((v) => {
        if (v == "refresh") {
          return {
            label: "刷新",
            callback: (_, done) => {
              refresh();
              done();
            },
          };
        }
        if (v == "edit") {
          return {
            label: "编辑",
            hidden: !getPermission("update"),
            callback: (_, done) => {
              rowEdit(row);
              done();
            },
          };
        }
        if (v == "delete") {
          return {
            label: "删除",
            hidden: !getPermission("delete"),
            callback: (_, done) => {
              rowDelete(row);
              done();
            },
          };
        }
        if (v == "check") {
        }
      });
    },
    // column处理
    renderColumns(columns = [], pKey = 0) {
      const { table = {} } = this.crud || {};
      return columns
        .filter((item) => !item.hidden)
        .map((item, index) => {
          let key = `${pKey}-${index}`;
          let column = {
            props: {
              align: this._align,
              ...item,
            },
          };
          // 数据列
          if (!item.type || item.type === "expand") {
            column.scopedSlots = {
              default: (scope) => {
                // 自定义插槽渲染
                const slot = this.$scopedSlots[`column-${item.prop}`];
                let value = get(scope.row, item.prop);
                let newScope = {
                  ...scope,
                  value,
                };
                if (slot) {
                  return slot(newScope);
                }
                if (item.render) {
                  return item.render(newScope);
                }
                if (item.formatter) {
                  return item.formatter(
                    scope.row,
                    scope.column,
                    value,
                    scope.$index
                  );
                }
                if (isEmpty(value)) {
                  return item.emptyText;
                }
                return value;
              },
              header: (scope) => {
                let slot = this.$scopedSlots[`header-${item.prop}`];
                if (slot) {
                  return slot(scope);
                }
                return item.label;
              },
            };
          }
          if (item.type == "index") {
            column.props.index = (i) => {
              return table.indexMethod
                ? table.indexMethod(i, this.crud)
                : i + 1;
            };
          }
          const children = item.children
            ? this.renderColumns(item.children, key)
            : null;

          return (
            <el-table-column key={"col-" + key} {...column}>
              {children}
            </el-table-column>
          );
        });
    },
    // 渲染空数据
    renderEmpty() {
      const { table = {} } = this.crud || {};
      if (isFunction(table.empty)) {
        return table.empty(this.$createElement);
      }
    },
    // 绑定 el-table 事件
    bindMethods() {
      const methods = [
        "clearSelection",
        "toggleRowSelection",
        "toggleAllSelection",
        "toggleRowExpansion",
        "setCurrentRow",
        "clearSort",
        "clearFilter",
        "doLayout",
        "sort",
      ];

      methods.forEach((n) => {
        this[n] = this.$refs["table"][n];
      });
    },
    // 绑定 el-table 回调
    bindEmits() {
      const emits = [
        "select",
        "select-all",
        "selection-change",
        "cell-mouse-enter",
        "cell-mouse-leave",
        "cell-click",
        "cell-dblclick",
        "row-click",
        "row-contextmenu",
        "row-dblclick",
        "header-click",
        "header-contextmenu",
        "filter-change",
        "current-change",
        "header-dragend",
        "expand-change",
      ];

      emits.forEach((name) => {
        this.emit[name] = (...args) => {
          this.$emit(name, ...args);
        };
      });
    },
  },
};
</script>
<style lang="scss">
.v-table {
  box-sizing: border-box;
  &__pager {
    padding: 5px 0;
  }
}
</style>
