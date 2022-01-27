<template>
  <div class="v-form-tabs">
    <ul :style="{ 'text-align': justify }" ref="tabs">
      <li
        v-for="(item, index) in list"
        :key="item.value"
        :ref="`tab-${index}`"
        :class="{ 'is-active': item.value === active }"
        :style="{
          color: item.value === active ? color : '#444',
        }"
        @click="update(item.value)"
      >
        {{ item.label }}
      </li>
      <div v-if="line.width" class="v-form-tabs__line" :style="line"></div>
    </ul>
  </div>
</template>
<script>
import { isArray, isEmpty } from "vue-crud/utils";

export default {
  name: "v-form-tabs",

  props: {
    value: [String, Number],
    labels: {
      type: Array,
      default: () => [],
    },
    justify: {
      type: String,
      default: "center",
    },
    color: {
      type: String,
      default: "#409EFF",
    },
  },

  data() {
    return {
      active: null,
      list: [],
      line: {
        width: "",
        offsetLeft: "",
      },
    };
  },

  watch: {
    value: {
      handler(val) {
        this.update(val);
      },
    },
  },

  mounted() {
    if (isArray(this.labels) && this.labels.length > 0) {
      this.list = this.labels;
      this.update(isEmpty(this.value) ? this.list[0].value : this.value);
    }
  },

  methods: {
    update(val) {
      this.$nextTick(() => {
        let index = this.list.findIndex((e) => e.value === val);
        let item = this.$refs[`tab-${index}`][0];
        if (item) {
          // 下划线位置
          this.line = {
            width: item.clientWidth + "px",
            transform: `translateX(${item.offsetLeft}px)`,
            "background-color": this.color,
          };

          // 靠左位置
          let left =
            item.offsetLeft +
            (item.clientWidth - document.body.clientWidth) / 2 +
            15;

          if (left < 0) {
            left = 0;
          }

          // 设置滚动距离
          this.$refs.tabs.scrollLeft = left;
        }
      });

      this.active = val;

      this.$emit("input", val);
      this.$emit("change", val);
    },
  },
};
</script>
<style lang="scss">
.v-form-tabs {
  margin-bottom: 20px;
  border-bottom: 1px solid #ccc;
  overflow: hidden;
  width: 100%;

  ul {
    height: 35px;
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    position: relative;
    scrollbar-width: none;
    box-sizing: border-box;
    margin: 0;

    &::-webkit-scrollbar {
      display: none;
    }

    li {
      display: inline-block;
      list-style: none;
      padding: 0 20px;
      height: 35px;
      line-height: 35px;
      box-sizing: border-box;
      cursor: pointer;
    }
  }

  &__line {
    height: 2px;
    width: 100%;
    position: absolute;
    bottom: -1px;
    left: 0;
    transition: transform 0.3s ease-in-out,
      width 0.2s 0.1s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
}
</style>
