<template>
  <el-dialog
    v-bind="props"
    :width="width"
    :fullscreen="isFullscreen"
    :visible="visible"
    :show-close="false"
    :custom-class="`v-dialog ${props.customClass || ''}`"
    @open="open"
    @opened="onOpened"
    @close="onClose"
    @closed="onClosed"
  >
    <template #title>
      <div
        v-if="!hiddenHeader"
        class="v-dialog__header"
        @dblclick="changeFullscreen()"
      >
        <!-- 标题  -->
        <span class="v-dialog__title">{{ title }}</span>
        <!-- 控制按钮 -->
        <div class="v-dialog__controls" v-if="!hiddenControls">
          <template v-for="(item, index) in controls">
            <!-- <RenderDom :key="index" /> -->
            <!-- 全屏切换按钮 -->
            <template v-if="item === 'fullscreen'">
              <button
                v-if="screen !== 'xs'"
                :key="index"
                type="button"
                :class="fullscreen ? 'minimize' : 'maximize'"
                @click="changeFullscreen(!fullscreen)"
              >
                <i class="el-icon-minus" v-if="fullscreen" />
                <i class="el-icon-full-screen" v-else />
              </button>
            </template>

            <button
              v-else-if="item === 'close'"
              :key="index"
              type="button"
              class="close"
              @click="beforeClose"
            >
              <i class="el-icon-close" />
            </button>
            <template v-else>
              {{ renderNode(item, { $scopedSlots }) }}
            </template>
          </template>
        </div>
      </div>
    </template>
    <div :key="cacheKey" :style="{ height: _height }">
      <slot />
    </div>
    <template #footer v-if="$slots.footer">
      <div class="v-dialog__footer">
        <slot name="footer" />
      </div>
    </template>
  </el-dialog>
</template>
<script>
import Screen from "../../mixins/screen";
import { isBoolean } from "../../utils";
import { renderNode } from "../../utils/vnode";
export default {
  name: "v-dialog",
  mixins: [Screen],
  // components: {
  //   RenderDom: {
  //     props: {
  //       vNode: [Array, String, Object, Number], // 这里为什么要这么写其实报一个类型检测不通过我补一个的，一开始我只写了数组和字符串。因为我这里其实不一定是vnode，毕竟直接传字符串和数字也可以，干嘛非得是vnode
  //     },
  //     render(h) {
  //       if (typeof this.vNode === "object") {
  //         return this.vNode;
  //       } else {
  //         return h("div", this.vNode);
  //       }
  //     },
  //   },
  // },
  props: {
    visible: Boolean,
    title: {
      type: String,
      default: "对话框",
    },
    // 高度
    height: String,
    // 宽度
    width: {
      type: String,
      default: "50%",
    },
    // 是否缓存
    keepAlive: Boolean,
    // 是否拖动
    drag: {
      type: Boolean,
      default: true,
    },
    // el-dialog 参数
    props: {
      type: Object,
      default: () => ({ fullscreen: false }),
    },
    // el-dialog 事件
    on: {
      type: Object,
      default: () => {
        return {};
      },
    },
    controls: {
      type: Array,
      default: () => ["fullscreen", "close"],
    },
    hiddenControls: {
      type: Boolean,
      default: false,
    },
    hiddenHeader: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      cacheKey: 0,
      fullscreen: this.props.fullscreen,
    };
  },
  computed: {
    isFullscreen() {
      return this.isMini ? true : this.fullscreen;
    },

    _height() {
      return this.height
        ? this.isFullscreen
          ? `calc(100vh - 46px)`
          : this.height
        : null;
    },
  },
  watch: {
    "props.fullscreen"(v) {
      this.fullscreen = v;
    },
    isFullscreen(v) {
      if (this.$el && this.$el.querySelector) {
        const el = this.$el.querySelector(".el-dialog");

        if (el) {
          el.style = v ? { top: 0, left: 0 } : { marginBottom: "50px" };
          el.querySelector(".el-dialog__header").style.cursor = v
            ? "text"
            : "move";
        }
      }

      if (this.crud) {
        this.crud.$emit("fullscreen-change");
      }
    },
    visible: {
      immediate: true,
      handler(v) {
        if (v) {
          this.dragEvent();
          return;
        }
        setTimeout(() => {
          this.changeFullscreen(false);
        }, 300);
      },
    },
  },
  methods: {
    renderNode,
    open() {
      if (!this.keepAlive) {
        this.cacheKey++;
      }

      this.$emit("update:visible", true);
      this.$emit("open");
    },
    onOpened() {
      this.$emit("opened");
    },
    beforeClose() {
      if (this.props["before-close"]) {
        this.props["before-close"](this.close);
      } else {
        this.close();
      }
    },
    close() {
      this.$emit("update:visible", false);
    },

    onClose() {
      this.$emit("close");
      this.close();
    },

    onClosed() {
      this.$emit("closed");
    },
    // 改变全屏状态
    changeFullscreen(v) {
      this.fullscreen = isBoolean(v) ? v : !this.fullscreen;
    },
    // 拖动事件
    dragEvent() {},
  },
};
</script>
<style lang="scss">
.v-dialog {
  .el-dialog {
    &__header {
      padding: 10px !important;
      text-align: center;
      border-bottom: 1px solid #f7f7f7;

      .el-dialog__title {
        font-size: 15px;
        letter-spacing: 0.5px;
      }

      .el-dialog__headerbtn {
        display: none;
        top: 13px;

        .el-dialog__close {
          font-size: 18px;
        }
      }

      &-slot {
        &.is-drag {
          user-select: none;
          cursor: move;
        }
      }
    }

    &__body {
      padding: 20px;
    }

    &__footer {
      padding-bottom: 15px;
    }
  }

  &__header {
    height: 25px;
    line-height: 25px;
    text-align: center;
    position: relative;
  }

  &__title {
    display: block;
    font-size: 15px;
    letter-spacing: 0.5px;
  }

  &__controls {
    display: flex;
    justify-content: flex-end;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 9;
    width: 100%;

    button,
    .minimize,
    .maximize,
    .close {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 25px;
      width: 40px;
      border: 0;
      background-color: #fff;
      cursor: pointer;
      outline: none;

      i {
        font-size: 16px;

        &:hover {
          opacity: 0.7;
        }
      }
    }
  }

  &.hidden-header {
    .el-dialog__header {
      display: none;
    }
  }
}
</style>
