<template>
  <div class="v-upsert">
    <v-form ref="form" bind-component-name="v-upsert" v-model="form" />
  </div>
</template>
<script>
import { Emitter } from "vue-el-crud/mixins";
import VForm from "../form";
export default {
  name: "v-upsert",
  mixins: [Emitter],
  components: {
    VForm,
  },
  inject: ["crud"],
  props: {
    // 表单值
    value: {
      type: Object,
      default: () => ({}),
    },
    // 表单项
    items: {
      type: Array,
      default: () => [],
    },
    // el-dialog 参数
    props: {
      type: Object,
      default: () => ({}),
    },
    // 编辑下是否同步打开
    sync: Boolean,
    // 操作按钮
    op: {
      type: Object,
      default: () => ({}),
    },
    // 对话框参数
    dialog: {
      type: Object,
      default: () => ({}),
    },
    // 打开前钩子 { editing, data, { submit, done, close } }
    onOpen: Function,
    // 关闭前钩子 { action, done }
    onClose: Function,
    // 获取详情前钩子 { data, { next, done, close } }
    onInfo: Function,
    // 提交前钩子 { editing, data, { next, done, close } }
    onSubmit: Function,
  },
  data() {
    return {
      editing: false,
      form: {},
    };
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler(v) {
        this.form = { ...v };
      },
    },
  },
  created() {
    this.$on("crud.add", this.add);
    this.$on("crud.append", this.append);
    this.$on("crud.edit", this.edit);
    this.$on("crud.close", this.close);
  },
  methods: {
    // 新增
    async add() {
      this.editing = false;
      this.form = {};
      await this.open();
      this.$emit("open", false, {});
    },
    // 追加
    async append(data) {
      this.editing = false;

      if (data) {
        for (let i in data) {
          this.$set(this.form, i, data[i]);
        }
      }

      await this.open();
      this.$emit("open", false, this.form);
    },
    // 编辑
    edit(data) {
      const { showLoading, hiddenLoading } = this.$refs.form;

      // 是否编辑模式
      this.editing = true;

      // 加载进度
      showLoading();

      // 是否同步打开
      if (!this.sync) {
        this.open();
      }

      // 完成
      const done = (data) => {
        this.$refs.form.rebindForm(data);
        hiddenLoading();
      };

      // 关闭
      const close = () => {
        hiddenLoading();
        this.close();
      };

      // 获取详情事件
      const next = (data) => {
        const { dict, service } = this.crud;

        // 获取请求方法
        const reqName = dict.api.info;

        return new Promise((resolve, reject) => {
          // 验证方法
          if (!service[reqName]) {
            reject(`Request function '${reqName}' is not fount!`);
            hiddenLoading();
            return null;
          }

          // 发送请求
          service[reqName]({
            id: data.id,
          })
            .then((res) => {
              done(res);
              resolve(res);

              // 同步打开
              if (this.sync) {
                this.open();
              }

              // 回调
              this.$emit("open", this.editing, this.form);
            })
            .catch((err) => {
              this.$message.error(err);
              reject(err);
            })
            .finally(() => {
              hiddenLoading();
            });
        });
      };

      if (this.onInfo) {
        this.onInfo(data, {
          next,
          done: (data) => {
            done(data);
            this.$emit("open", true, this.form);
          },
          close,
        });
      } else {
        next(data);
      }
    },
    // 打开
    open(cb) {
      const { saveButtonText, closeButtonText } = this.crud.dict.label;

      return new Promise((resolve) => {
        // console.log(this.items);
        this.$refs.form.open({
          title: this.editing ? "编辑" : "新增",
          props: this.props,
          dialog: this.dialog,
          items: this.items,
          op: {
            saveButtonText,
            closeButtonText,
            ...this.op,
          },
          on: {
            open: (_, { done, close }) => {
              if (this.onOpen) {
                this.onOpen(this.editing, this.form, {
                  submit: () => {
                    this.submit(this.form);
                  },
                  done,
                  close,
                });
              }

              resolve();
              cb && cb();
            },
            close: () => {
              if (this.onClose) {
                this.onClose(this.close);
              } else {
                this.close();
              }
            },
            submit: this.submit,
          },

          _data: {
            editing: this.editing,
          },
        });
      });
    },
    // 关闭
    close() {
      this.$refs.form.close();
      this.$emit("close");
    },
    /**
     * 表单提交
     * @param {object} data
     */
    submit(data, { done }) {
      const { dict, service } = this.crud;

      // 提交事件
      const next = (data) => {
        return new Promise((resolve, reject) => {
          // 获取请求方法
          const reqName = dict.api[this.editing ? "update" : "add"];

          // 验证请求方法
          if (!service[reqName]) {
            done();
            return reject(`Request function '${reqName}' is not fount!`);
          }

          // 发送请求
          service[reqName](data)
            .then((res) => {
              this.$message.success("保存成功");
              // 关闭弹窗
              this.close();
              // 刷新列表
              this.crud.refresh();
              // 回调
              resolve(res);
            })
            .catch((err) => {
              this.$message.error(err);
              reject(err);
            })
            .finally(done);
        });
      };

      // 钩子处理
      if (this.onSubmit) {
        this.onSubmit(this.editing, data, {
          done,
          next,
          close: () => {
            this.close("submit");
          },
          $refs: this.$crud.$refs,
        });
      } else {
        next(data);
      }
    },
  },
};
</script>
