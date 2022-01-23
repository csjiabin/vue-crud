<template>
  <div></div>
</template>
<script>
import { Emitter, Screen } from "vue-crud/mixins";
export default {
  name: "v-form",
  mixins: [Emitter, Screen],
  props: {
    // 表单值
    value: {
      type: Object,
      default: () => {
        return {};
      },
    },
    // 是否只显示表单
    inner: Boolean,
  },
  provide() {
    return {
      form: this.form,
    };
  },
  data() {
    return {
      visible: false,
      saving: false,
      loading: false,
      form: {},
    };
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler(v) {
        this.form = { ...v };
      },
    },
  },
  methods: {
    create(options = {}) {},
  },
};
</script>
