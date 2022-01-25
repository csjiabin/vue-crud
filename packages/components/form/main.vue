<script lang="jsx">
import { Emitter, Screen, Form } from "vue-crud/mixins";
import {
  deepMerge,
  isFunction,
  isEmpty,
  isString,
  isObject,
  isBoolean,
  cloneDeep,
} from "vue-crud/utils";
import valueHook from "vue-crud/hook/value";
import VDialog from "../dialog";
import VVnodes from "../vnodes";

export default {
  name: "v-form",
  mixins: [Emitter, Screen, Form],
  components: {
    VDialog,
    VVnodes,
  },
  props: {
    // 表单值
    value: {
      type: Object,
      default: () => ({}),
    },
    // 是否只显示表单
    inner: Boolean,
    // 绑定组件名，设置方法
    bindComponentName: String,
  },
  provide() {
    return {
      form: this.form,
    };
  },
  data() {
    return {
      visible: false,
      saving: false,
      loading: false,
      form: {},
      conf: {
        title: "自定义表单",
        width: "50%",
        props: {
          size: "small",
          "label-width": "100px",
        },
        on: {
          open: null,
          submit: null,
          close: null,
        },
        op: {
          hidden: false,
          saveButtonText: "保存",
          closeButtonText: "取消",
          buttons: ["close", "save"],
        },
        dialog: {
          props: {
            fullscreen: false,
            "close-on-click-modal": false,
            "append-to-body": true,
          },
          hiddenControls: false,
          controls: ["fullscreen", "close"],
        },
        items: [],
        _data: {},
      },
      tabActive: null,
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
  methods: {
    create(options = {}) {
      // 合并配置
      for (let i in this.conf) {
        switch (i) {
          case "items":
            this.conf.items = cloneDeep(options.items || []);
            break;
          case "title":
          case "width":
            this.conf[i] = options[i];
            break;
          default:
            deepMerge(this.conf[i], options[i]);
            break;
        }
      }
      // 预设表单值
      if (options.form) {
        for (let i in options.form) {
          this.$set(this.form, i, options.form[i]);
        }
      }
      // 设置表单默认值
      this.conf.items.map((e) => {
        if (e.prop) {
          this.$set(
            this.form,
            e.prop,
            valueHook.bind(
              isEmpty(this.form[e.prop])
                ? cloneDeep(e.value)
                : this.form[e.prop],
              e.hook,
              this.form
            )
          );
        }
      });
      // 打开回调
      const { open } = this.conf.on;

      if (open) {
        this.$nextTick(() => {
          open(this.form, {
            close: this.close,
            submit: this.submit,
            done: this.done,
          });
        });
      }

      return this;
    },
    open(options) {
      this.visible = true;
      return this.create(options);
    },
    beforeClose() {
      if (this.conf.on.close) {
        this.conf.on.close(this.close);
      } else {
        this.close();
      }
    },
    close() {
      this.visible = false;
      this.clear();
      this.done();
    },
    onClosed() {
      this.tabActive = null;

      for (let i in this.form) {
        delete this.form[i];
      }
    },
    done() {
      this.saving = false;
    },
    clear() {
      this.clearValidate();
    },
    submit(callback) {
      // 验证表单
      this.$refs.form.validate(async (valid, error) => {
        if (!valid) {
          // 判断是否使用form-tabs，切换到对应的选项卡
          const keys = Object.keys(error);

          if (this.tabActive) {
            const item = this.conf.items.find((e) => e.prop === keys[0]);

            if (item) {
              this.tabActive = item.group;
            }
          }
          return;
        }
        this.saving = true;
        // 响应方法
        const res = {
          done: this.done,
          close: this.close,
          $refs: this.$crud.$refs,
        };
        // 表单数据
        const form = cloneDeep(this.form);
        // 过滤被隐藏的数据
        this.conf.items.forEach((v) => {
          if (v._hidden) {
            delete form[v.prop];
          }

          if (v.hook) {
            form[v.prop] = valueHook.submit(form[v.prop], v.hook, form);
          }
        });

        // 提交钩子
        const submit = callback || this.conf.on.submit;

        // 提交事件
        if (isFunction(submit)) {
          submit(form, res);
          return;
        }
        this.saving = false;
        console.error("Not found callback function");
      });
    },
    // 重新绑定表单数据
    rebindForm(data) {
      let form = {};
      this.conf.items.forEach((v) => {
        form[v.prop] = v.hook
          ? valueHook.bind(data[v.prop], v.hook, data)
          : data[v.prop];
      });

      Object.assign(this.form, data, form);
    },
    // 渲染表单
    renderForm() {
      const { props, items, _data } = this.conf;
      return (
        <el-form
          ref="form"
          {...{
            props: {
              "label-position": this.isMini ? "top" : "",
              disabled: this.saving,
              model: this.form,
              ...props,
            },
          }}
        >
          {/* 表单项列表 */}
          <el-row gutter={10} v-loading={this.loading}>
            {items.map((v, i) => {
              let key = `form-item-${v.prop || i}`;
              if (v.hidden) return;
              // 是否分组显示
              v._group =
                isEmpty(this.tabActive) || isEmpty(v.group)
                  ? true
                  : v.group === this.tabActive;

              v._label = { text: "" };
              // 解析标题
              if (isString(vlabel)) {
                v_label = {
                  text: v.label,
                };
              } else if (isObject(v.label)) {
                v._label = v.label;
              }
              return (
                <el-col
                  key={key}
                  {...{
                    props: {
                      key: i,
                      span: 24,
                      ...v,
                    },
                  }}
                ></el-col>
              );
            })}
          </el-row>
        </el-form>
      );
    },
    // 渲染操作按钮
    renderOp() {
      const { style } = this.$crud.options;
      const { hidden, buttons, saveButtonText, closeButtonText } = this.conf.op;
      const { size = "small" } = this.conf.props;
      if (hidden) return;
      return buttons.map((vnode) => {
        if (vnode == "save") {
          return (
            <el-button
              {...{
                props: {
                  size,
                  type: "success",
                  disabled: this.loading,
                  loading: this.saving,
                  ...style.saveBtn,
                },
                on: {
                  click: this.submit,
                },
              }}
            >
              {saveButtonText}
            </el-button>
          );
        }
        if (vnode == "close") {
          return (
            <el-button
              {...{
                props: {
                  size,
                  ...style.closeBtn,
                },
                on: {
                  click: this.beforeClose,
                },
              }}
            >
              {closeButtonText}
            </el-button>
          );
        }
        if (vnode?.render) {
          return vnode.render(this.form, this.$createElement);
        }
        let slot = this.$scopedSlots[vnode?.name];
        return <v-vnodes vnodes={slot(this.form)} />;
      });
    },
  },
  render() {
    const form = (
      <div class="v-form">
        <div class="v-form__container">{this.renderForm()}</div>
        <div class="v-form__footer">{this.renderOp()}</div>
      </div>
    );
    if (this.inner) {
      return form;
    }
    const { title, width, dialog } = this.conf;
    let args = {
      title,
      width,
      props: {
        ...dialog.props,
      },
      on: {},
    };
    return <v-dialog {...args}>{form}</v-dialog>;
  },
};
</script>
