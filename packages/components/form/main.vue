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
import VFormTabs from "../form-tabs";

import { renderNode } from "../vnode";

export default {
  name: "v-form",
  mixins: [Emitter, Screen, Form],
  components: {
    VDialog,
    VFormTabs,
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
    options: Object,
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
          resetButtonText: "重置",
          buttons: ["close", "save"],
        },
        dialog: {
          props: {
            fullscreen: false,
            closeOnClickModal: false,
            appendToBody: true,
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
    options: {
      deep: true,
      immediate: true,
      handler: "create",
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
      let args = {
        close: this.close,
        submit: this.submit,
        done: this.done,
        reset: this.reset,
        rebindForm: this.rebindForm,
        ctx: this,
      };
      if (open) {
        this.$nextTick(() => {
          open(this.form, args);
        });
      }
      // console.log(this.form);
      return args;
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
    reset() {
      this.resetFields();
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
      // console.log(this.form);
    },
    // 渲染表单
    renderForm() {
      const { props, items } = this.conf;
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
              if (v.type == "tabs") {
                return (
                  <v-form-tabs
                    v-model={this.tabActive}
                    {...{ props: { ...v.props } }}
                  />
                );
              }
              if (v.hidden) return;
              // 是否分组显示
              v._group =
                isEmpty(this.tabActive) || isEmpty(v.group)
                  ? true
                  : v.group === this.tabActive;

              v._label = { text: "" };
              // 解析标题
              if (isString(v.label)) {
                v._label = {
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
                >
                  {v.component && (
                    <el-form-item
                      v-show={v._group}
                      {...{
                        props: {
                          label: v._label.text,
                          prop: v.prop,
                          rules: v.rules,
                          ...v.props,
                        },
                      }}
                    >
                      {/* render label */}
                      <template slot="label">
                        <el-tooltip
                          effect="dark"
                          placement="top"
                          content={v._label.tip}
                          disabled={!v._label.tip}
                        >
                          <span>
                            {v._label.text}
                            {v._label.icon && <i class={v._label.icon}></i>}
                          </span>
                        </el-tooltip>
                      </template>
                      {/* Form item */}
                      <div class="v-form-item">
                        {/* Component */}
                        {["prepend", "component", "append"].map((name) => {
                          if (!v[name]) return;
                          return (
                            <div
                              v-show={!v.collapse}
                              class={[
                                `v-form-item__${name}`,
                                {
                                  "is-flex": isEmpty(v.flex) ? true : v.flex,
                                },
                              ]}
                            >
                              {renderNode(v[name], {
                                prop: v.prop,
                                scope: this.form,
                                vm: this,
                              })}
                            </div>
                          );
                        })}
                      </div>
                      {/* Collapse button */}
                      {isBoolean(v.collapse) && (
                        <div
                          class="cl-form-item__collapse"
                          onClick={() => this.collapseItem(v)}
                        >
                          <el-divider content-position="center">
                            {v.collapse ? (
                              <span>
                                查看更多
                                <i class="el-icon-arrow-down" />
                              </span>
                            ) : (
                              <span>
                                隐藏内容
                                <i class="el-icon-arrow-up" />
                              </span>
                            )}
                          </el-divider>
                        </div>
                      )}
                    </el-form-item>
                  )}
                </el-col>
              );
            })}
          </el-row>
        </el-form>
      );
    },
    // 渲染操作按钮
    renderOp() {
      const { style } = this.$crud?.options ?? {};
      if (!style) return;
      const {
        hidden,
        buttons,
        saveButtonText,
        resetButtonText,
        closeButtonText,
      } = this.conf.op;
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
                  click: () => this.submit(),
                },
              }}
            >
              {saveButtonText}
            </el-button>
          );
        }
        if (vnode == "reset") {
          return (
            <el-button
              {...{
                props: {
                  size,
                  disabled: this.saving,
                  ...style.resetBtn,
                },
                on: {
                  click: this.reset,
                },
              }}
            >
              {resetButtonText}
            </el-button>
          );
        }
        if (vnode == "close") {
          return (
            <el-button
              {...{
                props: {
                  size,
                  disabled: this.saving,
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
        return renderNode(vnode, {
          scope: this.form,
          vm: this,
        });
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
    return (
      <v-dialog
        title={title}
        width={width}
        visible={this.visible}
        props={{
          ...dialog.props,
          top: "5vh",
          "before-close": this.beforeClose,
        }}
        on={{
          "update:visible": (v) => {
            this.visible = v;
          },
          "update:props:fullscreen": (v) => {
            dialog.props.fullscreen = v;
          },
          closed: this.onClosed,
        }}
      >
        {form}
      </v-dialog>
    );
  },
};
</script>
<style lang="scss">
.v-form {
  padding: 5px;

  .el-form-item {
    .el-input-number {
      &__decrease,
      &__increase {
        border: 0;
        background-color: transparent;
      }
    }

    &__label {
      .el-tooltip {
        i {
          margin-left: 5px;
        }
      }
    }
  }

  &-item {
    display: flex;

    &__prepend {
      margin-right: 10px;
    }

    &__component {
      &.is-flex {
        flex: 1;
        width: 100%;

        & > div {
          width: 100%;
        }
      }
    }

    &__append {
      margin-left: 10px;
    }

    &__collapse {
      width: 100%;
      font-size: 12px;
      cursor: pointer;

      .el-divider {
        margin: 16px 0;

        &__text {
          font-size: 12px;
        }
      }

      i {
        margin-left: 6px;
      }
    }
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
