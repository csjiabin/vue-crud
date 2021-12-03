<template>
  <div class="v-context-menu-list" :class="{ 'is-append': level > 1 }">
    <div
      v-for="(v, i) in _list"
      :key="joinIndex(i)"
      class="v-context-menu-list__item"
      :class="{
        'is-active': index.includes(joinIndex(i)),
        'is-ellipsis': v.ellipsis,
        'is-disabled': v.disabled,
      }"
    >
      <div
        class="v-context-menu-list__item--content"
        @click="handleClickItem(v, i)"
      >
        <template v-if="!v.render">
          <!-- 前缀图标 -->
          <i v-if="v['prefix-icon']" :class="v['prefix-icon']" />
          <span>{{ v.label }}</span>
          <!-- 后缀图标 -->
          <i v-if="v['suffix-icon']" :class="v['suffix-icon']" />
        </template>
        <vnodes v-else :vnodes="v.render($createElement, v)" />
      </div>
      <!-- 子节点 -->
      <template v-if="v.children && v._showChildren">
        <v-context-menu-list
          :list="v.children"
          :p-index="joinIndex(i)"
          :level="level + 1"
          :index="index"
          @click-node="handleClickItem"
        />
      </template>
    </div>
  </div>
</template>
<script>
import Vnodes from "../vnodes";
export default {
  name: "v-context-menu-list",
  components: {
    Vnodes,
  },
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    level: {
      type: Number,
      default: 1,
    },
    index: {
      type: String,
      default: "",
    },
    pIndex: {
      type: [Number, String],
      default: "",
    },
  },
  computed: {
    _list() {
      return this.list.filter((e) => !e.hidden);
    },
  },
  methods: {
    joinIndex(i) {
      if (!this.pIndex) {
        return i + "";
      }
      return [this.pIndex, i].join("-");
    },
    handleClickItem(v, i) {
      this.$emit("click-node", v, this.joinIndex(i));
    },
  },
};
</script>
