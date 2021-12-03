<template>
  <el-dialog
    ref="dialog"
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
    <template #title v-if="!hiddenHeader">
      <div class="v-dialog__header" @dblclick="changeFullscreen()">
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
              <slot :name="item" />
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
import Screen from "vue-crud/mixins/screen";
import { isBoolean, on, off } from "vue-crud/utils";
export default {
  name: "v-dialog",
  mixins: [Screen],
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
        if (v) return;
        setTimeout(() => {
          this.changeFullscreen(false);
        }, 300);
      },
    },
  },
  mounted() {
    const hdr = this.$el.querySelector(".el-dialog__header");
    if (!hdr) {
      return false;
    }
    on(hdr, "mousedown", this.dragEvent);
    this.$once("hook:beforeDestroy", () => {
      off(hdr, "mousedown", this.dragEvent);
    });
  },
  methods: {
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
    dragEvent(e) {
      const dlg = this.$el.querySelector(".el-dialog");
      const hdr = this.$el.querySelector(".el-dialog__header");
      // Props
      const { top = "15vh" } = this.props;
      // Body size
      const { clientWidth, clientHeight } = document.documentElement;
      // Try drag
      const isDrag = (() => {
        if (this.fullscreen) {
          return false;
        }
        if (!this.drag) {
          return false;
        }
        // Determine height of the box is too large
        let marginTop = 0;
        if (["vh", "%"].some((e) => top.includes(e))) {
          marginTop = clientHeight * (parseInt(top) / 100);
        }
        if (top.includes("px")) {
          marginTop = top;
        }
        if (dlg.clientHeight > clientHeight - 50 - marginTop) {
          return false;
        }
        return true;
      })();
      // Set header cursor state
      if (!isDrag) {
        return (hdr.style.cursor = "text");
      } else {
        hdr.style.cursor = "move";
      }
      // Set el-dialog style, hidden scroller
      dlg.style.marginTop = 0;
      dlg.style.marginBottom = 0;
      dlg.style.top = dlg.style.top || top;
      // Distance
      const dis = {
        left: e.clientX - hdr.offsetLeft,
        top: e.clientY - hdr.offsetTop,
      };
      // Calc left and top of the box
      const box = (() => {
        const { left, top } =
          dlg.currentStyle || window.getComputedStyle(dlg, null);
        if (left.includes("%")) {
          return {
            top: +clientHeight * (+top.replace(/\%/g, "") / 100),
            left: +clientWidth * (+left.replace(/\%/g, "") / 100),
          };
        } else {
          return {
            top: +top.replace(/\px/g, ""),
            left: +left.replace(/\px/g, ""),
          };
        }
      })();
      // Screen limit
      const pad = 5;
      const minLeft = -(clientWidth - dlg.clientWidth) / 2 + pad;
      const maxLeft =
        (dlg.clientWidth >= clientWidth / 2
          ? dlg.clientWidth / 2 - (dlg.clientWidth - clientWidth / 2)
          : dlg.clientWidth / 2 + clientWidth / 2 - dlg.clientWidth) - pad;
      const minTop = pad;
      const maxTop = clientHeight - dlg.clientHeight - pad;
      // Start move
      const onMousemove = (e) => {
        let left = e.clientX - dis.left + box.left;
        let top = e.clientY - dis.top + box.top;
        if (left < minLeft) {
          left = minLeft;
        } else if (left >= maxLeft) {
          left = maxLeft;
        }
        if (top < minTop) {
          top = minTop;
        } else if (top >= maxTop) {
          top = maxTop;
        }
        // Set dialog top and left
        dlg.style.top = top + "px";
        dlg.style.left = left + "px";
      };
      on(document, "mousemove", onMousemove);
      // Clear event
      document.onmouseup = () => {
        document.onmouseup = null;
        off(document, "mousemove", onMousemove);
      };
    },
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
      border-top: 1px solid #f7f7f7;
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
