<template>
  <div
    class="v-context-menu"
    :style="{ left: style.left + 'px', top: style.top + 'px' }"
    @contextmenu.stop.prevent
    v-show="visible"
    v-resize="close"
  >
    <slot>
      <vnodes :vnodes="renderList()" />
    </slot>
  </div>
</template>
<script>
import { contains, on, off } from "~/utils";
import { resize } from "~/directives";
import Vnodes from "../vnodes";
export default {
  name: "v-context-menu",
  components: {
    Vnodes,
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
  mounted() {
    on(document.documentElement, "mousedown", this.onMousedown);
    this.$once("hook:beforeDestroy", () => {
      off(document.documentElement, "mousedown", this.onMousedown);
    });
  },
  methods: {
    renderList() {
      const deep = (list, level) => {
        return (
          <div class={["v-context-menu-list", level > 1 && "is-append"]}>
            {list
              .filter((e) => !e.hidden)
              .map((e, i) => {
                e._index = `${level}-${i}`;

                return (
                  <div
                    key={e._index}
                    class={{
                      "is-active": this.index.includes(e._index),
                      "is-ellipsis": e.ellipsis,
                      "is-disabled": e.disabled,
                    }}
                  >
                    {/* 前缀图标 */}
                    {e["prefix-icon"] && <i class={e["prefix-icon"]} />}

                    {/* 标题 */}
                    <span on-click={() => this.clickRow(e)}>{e.label}</span>

                    {/* 后缀图标 */}
                    {e["suffix-icon"] && <i class={e["suffix-icon"]} />}

                    {/* 子节点 */}
                    {e.children &&
                      e.showChildren &&
                      deep(e.children, level + 1)}
                  </div>
                );
              })}
          </div>
        );
      };
      return deep(this.list, 1);
    },
    onMousedown(e) {
      if (!contains(this.$el, e.target) && this.$el != e.target) {
        this.close();
      }
    },
    open(event, options) {
      let { pageX, pageY } = event || {};
      let { list } = options || {};

      let position = {
        left: pageX,
        top: pageY,
      };

      if (list) {
        this.list = list;
      }
      this.visible = true;
      this.index = "";
      this.$nextTick(() => {
        const el = this.$el.querySelector(".v-context-menu-list");
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

      this.stopDefault(event);
      this.hiddenChildren();

      return {
        close: this.close,
      };
    },
    close() {
      this.visible = false;
      this.index = "";
    },
    clickRow(e) {
      this.index = e._index;

      if (e.disabled) {
        return false;
      }

      if (e.callback) {
        return e.callback(e, () => {
          this.close();
        });
      }

      if (e.children) {
        e.showChildren = !e.showChildren;
      } else {
        this.close();
      }
    },
    hiddenChildren() {
      const deep = (list) => {
        list.forEach((e) => {
          this.$set(e, "showChildren", false);

          if (e.children) {
            deep(e.children);
          }
        });
      };

      deep(this.list);
    },

    stopDefault(e) {
      e.preventDefault();
      e.stopPropagation();
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

    & > div {
      display: flex;
      align-items: center;
      height: 35px;
      font-size: 13px;
      cursor: pointer;
      padding: 0 15px;
      color: #666;
      position: relative;

      span {
        height: 35px;
        line-height: 35px;
        flex: 1;
        text-align: left;
      }

      &:hover {
        background-color: #f7f7f7;
        color: #000;
      }

      i {
        &:first-child {
          margin-right: 5px;
        }

        &:last-child {
          margin-left: 5px;
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
