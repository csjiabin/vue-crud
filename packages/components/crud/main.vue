<template>
  <div
    :class="['v-crud', { 'is-border': border }]"
    :style="{ padding: padding + 'px' }"
    v-on="$listeners"
  >
    <slot />
  </div>
</template>
<script>
import { Emitter } from "vue-crud/mixins";
import {
  deepMerge,
  isArray,
  isString,
  isObject,
  isFunction,
} from "vue-crud/utils";
import bootstrap from "vue-crud/bootstrap";
export default {
  name: "v-crud",
  mixins: [Emitter],
  props: {
    // 是否带有边框
    border: Boolean,
    padding: {
      type: Number,
      default: 10,
    },
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
      response: {
        list: [],
        pagination: {},
      },
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
          keyword: "keyword",
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
  },
  mounted() {
    const ctx = bootstrap(this);
    // Loaded
    this.$emit("load", ctx);

    // 绑定自定义事件
    this.bindEvent(ctx);
  },
  methods: {
    // 刷新请求
    refresh(query = {}) {
      // 设置参数
      let params = this.paramsReplace({ ...this.params, ...query });
      // Loading
      this.loading = true;

      // 刷新完成事件
      const done = () => {
        this.loading = false;
      };

      // 渲染
      const render = (list, pagination = {}) => {
        this.response = {
          list,
          pagination,
        };
        this.broadcast("v-table", "crud.refresh", { list });
        this.broadcast("v-pagination", "crud.refresh", pagination);
        done();
      };
      // 预防脏数据
      let rd = (this.test.refreshRd = Math.random());

      // 请求执行
      const next = (params) => {
        return new Promise((resolve, reject) => {
          const reqName = this.dict.api.page;
          let func = this.service[reqName];
          if (!func) {
            done();
            return reject(`Request function '${reqName}' is not fount`);
          }
          func(params)
            .then((res) => {
              if (rd != this.test.refreshRd) {
                return false;
              }

              if (isString(res)) {
                return reject("Response error");
              }

              if (isArray(res)) {
                render(res);
              } else if (isObject(res)) {
                render(res.list, res.pagination);
              }
              resolve(res);
            })
            .catch((err) => {
              this.$message.error(err);
              reject(err);
            })
            .finally(() => {
              done();
              this.test.sortLock = true;
            });
        });
      };

      if (this.onRefresh) {
        return this.onRefresh(params, { next, done, render });
      } else {
        return next(params);
      }
    },
    // 完成渲染
    done() {
      this.test.process = true;
    },

    // 替换参数值
    paramsReplace(params) {
      const { pagination, search, sort } = this.dict;
      let a = { ...params };
      let b = { ...pagination, ...search, ...sort };

      for (let i in b) {
        if (a.hasOwnProperty(i)) {
          if (i != b[i]) {
            a[`_${b[i]}`] = a[i];

            delete a[i];
          }
        }
      }

      for (let i in a) {
        if (i[0] === "_") {
          a[i.substr(1)] = a[i];

          delete a[i];
        }
      }

      return a;
    },
    // 绑定自定义事件
    bindEvent(res) {
      const { options, inst } = this.$crud;
      for (let k in options.events) {
        let event = options.events[k];
        let mode = null;
        let callback = null;

        if (isObject(event)) {
          mode = event.mode;
          callback = event.callback;
        } else {
          mode = "on";
          callback = event;
        }

        if (!["on", "once"].includes(mode)) {
          return console.error(k, "mode must be (on / once)");
        }

        if (!isFunction(callback)) {
          return console.error(k, "callback is not a function");
        }
        inst[`$${mode}`](k, (data) => {
          callback(data, res);
        });
      }
    },
    // 获取权限
    getPermission(key) {
      if (!key) {
        return this.permission;
      }

      return this.permission[key];
    },
    // 新增
    rowAdd() {
      console.log(this);
      this.broadcast("cl-upsert", "crud.add");
    },

    // 编辑
    rowEdit(data) {
      this.broadcast("cl-upsert", "crud.edit", data);
    },
    // 追加
    rowAppend(data) {
      this.broadcast("cl-upsert", "crud.append", data);
    },
    // 关闭
    rowClose() {
      this.broadcast("cl-upsert", "crud.close");
    },
    rowDelete(...selection) {
      // 获取请求方法
      const reqName = this.dict.api.delete;

      let params = {
        ids: selection.map((e) => e.id),
      };
      // 删除事件
      const next = (params) => {
        return new Promise((resolve, reject) => {
          this.$confirm(`此操作将永久删除选中数据，是否继续？`, "提示", {
            type: "warning",
          })
            .then((res) => {
              if (res === "confirm") {
                // Validate
                if (!this.service[reqName]) {
                  return reject(`Request function '${reqName}' is not fount`);
                }

                // Send request
                this.service[reqName](params)
                  .then((res) => {
                    this.$message.success(`删除成功`);
                    this.refresh();
                    resolve(res);
                  })
                  .catch((err) => {
                    this.$message.error(err);
                    reject(err);
                  });
              }
            })
            .catch(() => null);
        });
      };

      if (this.onDelete) {
        this.onDelete(selection, { next });
      } else {
        next(params);
      }
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
