<template>
  <div class="v-flex1">
    <slot />
  </div>
</template>
<script>
export default {
  name: "v-flex1",
};
</script>
<style lang="scss">
.v-flex1 {
  flex: 1;
}
</style>
