<template>
  <div class="v-filter">
    <span class="v-filter__label" v-if="label">
      {{ label }}
    </span>
    <slot />
  </div>
</template>
<script>
export default {
  name: "v-filter",
  props: {
    label: String,
  },
};
</script>
<style lang="scss">
.v-filter {
  display: inline-flex;
  align-items: center;
  & + & {
    margin-left: 10px;
  }
  &__label {
    font-size: 12px;
    margin-right: 10px;
    white-space: nowrap;
    user-select: none;
  }
}
</style>
