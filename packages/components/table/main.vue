<template>
  <div v-resize="calcMaxHeight">
    <el-table ref="table" v-bind="tableProps" v-on="listeners">
      <vnodes :vnodes="renderColumns(columns)" />
      <slot slot="append" name="append" />
      <slot slot="empty" name="empty">
        <vnodes v-if="!emptyText" :vnodes="renderEmpty()" />
      </slot>
    </el-table>
  </div>
</template>
<script lang="jsx">
import { Emitter, Screen } from "vue-crud/mixins";
import { resize } from "vue-crud/directives";
import { isString, isFunction, isEmpty, get } from "vue-crud/utils";

import Vnodes from "../vnodes";

export default {
  name: "v-table",
  mixins: [Emitter, Screen],
  directives: {
    resize,
  },
  inject: ["crud"],
  components: {
    Vnodes,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
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
    // 开启右键菜单
    contextMenu: [Boolean, Array],
    align: String,
    // 排序刷新
    sortRefresh: {
      type: Boolean,
      default: true,
    },
    pagination: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      maxHeight: null,
      list: this.data,
      emit: {},
    };
  },
  computed: {
    emptyText() {
      return this.props["empty-text"] || this.props["emptyText"];
    },
    tableProps() {
      const { table = {} } = this.crud || {};
      let emptyText = "";
      if (isString(table.empty)) {
        emptyText = table.empty;
      }
      if (this.emptyText) {
        emptyText = this.emptyText;
      }
      return {
        ...this.props,
        emptyText,
        data: this.list,
      };
    },
    listeners() {
      return {
        ...this.on,
        "sort-change": this.handleSortChange,
      };
    },
    _align() {
      const { table = {} } = this.crud || {};
      return this.align || table.align;
    },
  },
  watch: {
    data: {
      deep: true,
      handler(v) {
        this.list = v;
      },
    },
  },
  created() {
    // 获取默认排序
    const { order, prop } = this.props["default-sort"] || {};
    const { params = {} } = this.crud || {};
    if (order && prop) {
      params.order = order === "descending" ? "desc" : "asc";
      params.prop = prop;
    }

    // 事件监听
    this.$on("crud.refresh", ({ list }) => {
      this.list = list;
    });
  },
  mounted() {
    this.calcMaxHeight();
    console.log(this.on);
  },
  methods: {
    // 计算表格最大高度
    calcMaxHeight() {
      if (!this.autoHeight) return;
      this.$nextTick(() => {
        const el = this.crud?.$el?.parentNode;
        let { height = "" } = this.props || {};

        if (el) {
          let rows = el.querySelectorAll(".cl-crud .el-row");

          if (!rows[0] || !rows[0].isConnected) return;

          let h = 25;

          for (let i = 0; i < rows.length; i++) {
            let f = true;

            for (let j = 0; j < rows[i].childNodes.length; j++) {
              if (rows[i].childNodes[j].className == "cl-table") {
                f = false;
              }
            }

            if (f) {
              h += rows[i].clientHeight + 5;
            }
          }

          let h1 = Number(String(height).replace("px", ""));
          let h2 = el.clientHeight - h;

          this.maxHeight = h1 > h2 ? h1 : h2;
        }
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
      let sortChange = this.on["sort-change"];
      sortChange && sortChange({ column, prop, order });
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
          if (column.type !== "selection") {
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
          if (column.type == "index") {
            column.index = (i) => {
              return table.indexMethod
                ? table.indexMethod(i, this.crud)
                : i + 1;
            };
          }
          const children = item.children
            ? this.renderColumns(item.children, key)
            : null;
          return (
            <el-table-column key={key} {...column}>
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
  },
};
</script>
