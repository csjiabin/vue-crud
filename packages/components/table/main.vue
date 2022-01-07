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
import { isString, isFunction } from "vue-crud/utils";

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
    align: String,
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
  computed: {
    emptyText() {
      return this.props["empty-text"] || this.props["emptyText"];
    },
    tableProps() {
      const { table = {} } = this.crud;
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
      };
    },
    listeners() {
      return {
        ...this.on,
        "sort-change": this.handleSortChange,
      };
    },
    _align() {
      const { table = {} } = this.crud;
      return this.align || table.align;
    },
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
  mounted() {
    this.calcMaxHeight();
  },
  methods: {
    // 计算表格最大高度
    calcMaxHeight() {
      if (!this.autoHeight) {
        return false;
      }

      return this.$nextTick(() => {
        const el = this.crud.$el.parentNode;
        let { height = "" } = this.props || {};

        if (el) {
          let rows = el.querySelectorAll(".cl-crud .el-row");

          if (!rows[0] || !rows[0].isConnected) {
            return false;
          }

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
      this.on["sort-change"]?.({ column, prop, order });
    },
    // column处理
    renderColumns(columns = [], pKey = 0) {
      return columns
        .filter((column) => !column.hidden)
        .map((column, index) => {
          let key = `${pKey}-${index}`;
          let params = {
            props: {
              align: this._align,
              ...column,
            },
          };
          const children = column.children
            ? this.renderColumns(column.children, key)
            : null;
          return (
            <el-table-column key={key} {...params}>
              {children}
            </el-table-column>
          );
        });
    },
    // 渲染空数据
    renderEmpty() {
      const { table = {} } = this.crud;
      if (isFunction(table.empty)) {
        return table.empty(this.$createElement);
      }
    },
  },
};
</script>
