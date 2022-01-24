<template>
  <el-button
    v-if="crud.getPermission('add')"
    v-bind="btnProps"
    @click="crud.rowAdd()"
  >
    <slot>{{ crud.dict.label.add }}</slot>
  </el-button>
</template>
<script>
export default {
  name: "v-add-btn",
  inject: ["crud"],
  computed: {
    btnProps() {
      const { style } = this.crud;
      return {
        type: "primary",
        icon: "el-icon-plus",
        ...style.addBtn,
        ...this.$attrs,
      };
    },
  },
};
</script>
