<template>
  <div
    class="v-context-menu"
    :style="{ left: style.left + 'px', top: style.top + 'px' }"
    @contextmenu.stop.prevent
    v-show="visible"
    v-resize="close"
  >
    <div class="v-context-menu__box">
      <slot>
        <menu-list :list="list" :index="index" @click-node="clickNode" />
      </slot>
    </div>
  </div>
</template>
<script>
import { contains, on, off } from "vue-crud/utils";
import { resize } from "vue-crud/directives";
import MenuList from "./menu-list.vue";
export default {
  name: "v-context-menu",
  components: {
    MenuList,
  },
  directives: {
    resize,
  },
  data() {
    return {
      visible: false,
      index: "",
      style: {
        left: 0,
        top: 0,
      },
      list: [],
    };
  },
  created() {
    on(document.body, "mousedown", this.onMousedown);
    this.$once("hook:beforeDestroy", () => {
      off(document.body, "mousedown", this.onMousedown);
    });
  },
  methods: {
    onMousedown(e) {
      if (!contains(this.$el, e.target) && this.$el != e.target) {
        this.close();
      }
    },
    /**
     *
     * @param {event} evt
     * @param {{list:[]}} options
     */
    open(evt, options) {
      let { pageX, pageY } = evt || {};
      let { list } = options || {};
      let position = {
        left: pageX,
        top: pageY,
      };
      this.list = list ?? [];
      this.visible = true;
      this.index = "";
      this.$nextTick(() => {
        const el = this.$el.querySelector(".v-context-menu__box");
        if (!el) return;
        const { clientHeight: h1, clientWidth: w1 } = document.body;
        const { clientHeight: h2, clientWidth: w2 } = el;
        if (pageY + h2 > h1) {
          position.top = h1 - h2 - 5;
        }
        if (pageX + w2 > w1) {
          position.left = w1 - w2 - 5;
        }
        this.style = position;
      });
      evt.preventDefault();
      evt.stopPropagation();
      this.hiddenChildren();
      return {
        close: this.close,
      };
    },
    close() {
      this.visible = false;
      this.index = "";
    },
    clickNode(e, index) {
      this.index = index;
      if (e.disabled) return;
      if (e.callback) {
        return e.callback(e, () => {
          this.close();
        });
      }
      if (e.children) {
        e._showChildren = !e._showChildren;
      } else {
        this.close();
      }
    },
    hiddenChildren() {
      const deep = (list) => {
        list.forEach((e) => {
          this.$set(e, "_showChildren", false);
          if (e.children) {
            deep(e.children);
          }
        });
      };
      deep(this.list);
    },
  },
};
</script>
<style lang="scss">
.v-context-menu {
  position: absolute;
  z-index: 9999;
  &-list {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    width: 160px;
    padding: 5px 0;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    top: 0;
    &.is-append {
      right: calc(-100% - 5px);
      top: -5px;
    }
    &__item {
      height: 35px;
      font-size: 13px;
      cursor: pointer;
      padding: 0 15px;
      color: #666;
      position: relative;
      &:hover {
        background-color: #f7f7f7;
        color: #000;
      }
      &--content {
        display: flex;
        align-items: center;
        height: 100%;
        span {
          flex: 1;
          text-align: left;
        }

        i {
          &:first-child {
            margin-right: 5px;
          }
          &:last-child {
            margin-left: 5px;
          }
        }
      }

      &.is-active {
        background-color: #f7f7f7;
        color: #000;
      }
      &.is-ellipsis {
        span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      &.is-disabled {
        span {
          color: #ccc;
          &:hover {
            color: #ccc;
          }
        }
      }
    }
  }
}
</style>
