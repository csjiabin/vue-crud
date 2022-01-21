<template>
  <div class="v-filter-group">
    <slot />
    <div class="v-filter-group__op">
      <slot name="op">
        <el-button
          type="primary"
          icon="el-icon-search"
          v-bind="crud.style.filterSearchBtn"
          :loading="crud.loading"
          @click="search"
        >
          搜索
        </el-button>
        <el-button :disabled="crud.loading" @click="reset">重置</el-button>
      </slot>
    </div>
  </div>
</template>
<script>
import { cloneDeep } from "vue-crud/utils";
export default {
  name: "v-filter-group",
  inject: ["crud"],
  props: {
    // 表单值
    value: {
      type: Object,
      default: () => ({}),
    },

    // 搜索时钩子, data, { next }
    onSearch: Function,
  },
  data() {
    return {
      oForm: cloneDeep(this.value),
      form: {},
    };
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(val) {
        this.form = val;
      },
    },
  },
  methods: {
    handleNext(params) {
      this.crud.refresh({
        ...this.form,
        page: 1,
        ...params,
      });
    },
    // 搜索
    search() {
      this.$emit("input", this.form);
      const next = this.handleNext;
      if (this.onSearch) {
        this.onSearch(this.form, { next });
      } else {
        next();
      }
    },
    // 重置
    reset() {
      this.form = cloneDeep(this.oForm);
      this.search();
      this.$emit("reset");
    },
  },
};
</script>
<style lang="scss">
.v-filter-group {
  display: inline-flex;
  margin: 0 10px;
}
</style>
