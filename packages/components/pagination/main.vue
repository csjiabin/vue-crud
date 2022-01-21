<template>
  <el-pagination v-bind="pagerProps" v-on="pagerEvents" />
</template>
<script>
export default {
  name: "v-pagination",
  inject: ["crud"],
  props: {
    props: {
      type: Object,
      default: () => {
        return {};
      },
    },
    on: Object,
  },
  data() {
    return {
      total: 0,
      currentPage: 1,
      pageSize: 20,
    };
  },
  computed: {
    response() {
      return this.crud.response;
    },
    pagerProps() {
      const { disabled } = this.props;
      const { loading } = this.crud;
      return {
        background: true,
        layout: "total, sizes, prev, pager, next, jumper",
        ...this.props,
        disabled: disabled || loading,
        total: this.total,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      };
    },
    pagerEvents() {
      return {
        ...this.on,
        "size-change": this.sizeChange,
        "current-change": this.currentChange,
      };
    },
  },
  watch: {
    props: {
      immediate: true,
      handler: "setPager",
    },
    // "response.pagination": {
    //   immediate: true,
    //   handler(v) {
    //     if (!v) return;
    //     this.setPager(v);
    //   },
    // },
  },
  created() {
    this.$on("crud.refresh", this.setPager);
    this.$once("hook:beforeDestroy", () => {
      this.$off("crud.refresh", this.setPager);
    });
  },
  methods: {
    setPager(res) {
      if (!res) return;
      this.currentPage = res.currentPage || res.page || 1;
      this.pageSize = res.pageSize || res.size || 20;
      this.total = res.total | 0;
      this.crud.params.size = this.pageSize;
      this.crud.params.page = this.currentPage;
    },
    currentChange(page) {
      this.currentPage = page;
      this.on["current-change"]?.(page);
      this.pagerChange();
    },
    sizeChange(size) {
      this.pageSize = size;
      this.on["size-change"]?.(size);
      this.pagerChange();
    },
    pagerChange() {
      let params = {
        page: this.currentPage,
        size: this.pageSize,
      };
      this.crud.refresh(params);
      this.on["pager-change"]?.(params);
    },
  },
};
</script>
