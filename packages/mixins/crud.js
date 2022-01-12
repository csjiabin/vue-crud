export default {
  inject: ["crud"],
  computed: {
    refreshEmit() {
      return 'crud.refresh' + this.crud.key
    }
  }
}