<template>
  <div class="v-upsert">
    <v-form ref="form" v-model="form"></v-form>
  </div>
</template>
<script>
import { Emitter } from "vue-crud/mixins";
import VForm from "../form";
export default {
  name: "v-upsert",
  mixins: [Emitter],
  components: {
    VForm,
  },
  inject: ["crud"],
  props: {
    // 表单值
    value: {
      type: Object,
      default: () => ({}),
    },
    // 表单项
    items: Array,
    // el-dialog 参数
    props: {
      type: Object,
      default: () => ({}),
    },
    // 编辑下是否同步打开
    sync: Boolean,
    // 操作按钮
    op: Object,
    // 对话框参数
    dialog: Object,
    // 打开前钩子 { isEdit, data, { submit, done, close } }
    onOpen: Function,
    // 关闭前钩子 { action, done }
    onClose: Function,
    // 获取详情前钩子 { data, { next, done, close } }
    onInfo: Function,
    // 提交前钩子 { isEdit, data, { next, done, close } }
    onSubmit: Function,
  },
  data() {
    return {
      editing: false,
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
  created() {
    // this.$on("crud.add", this.add);
    // this.$on("crud.append", this.append);
    // this.$on("crud.edit", this.edit);
    // this.$on("crud.close", this.close);
  },
};
</script>
