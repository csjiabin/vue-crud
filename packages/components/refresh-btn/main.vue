<template>
  <el-button v-bind="btnProps" @click="crud.refresh()">
    <slot>{{ crud.dict.label.refresh }}</slot>
  </el-button>
</template>
<script>
export default {
  name: "v-refresh-btn",
  inject: ["crud"],
  computed: {
    btnProps() {
      const { style, loading } = this.crud;
      return {
        type: "primary",
        ...style.refreshBtn,
        ...this.$attrs,
        loading,
      };
    },
  },
};
</script>
