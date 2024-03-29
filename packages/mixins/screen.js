import { on, off } from "../utils";
export default {
  data() {
    return {
      screen: "full",
    };
  },

  computed: {
    isMini() {
      return this.screen === "xs";
    },
  },

  created() {
    const fn = () => {
      const w = document.body.clientWidth;

      if (w < 768) {
        this.screen = "xs";
      } else if (w < 992) {
        this.screen = "sm";
      } else if (w < 1200) {
        this.screen = "md";
      } else if (w < 1920) {
        this.screen = "xl";
      } else {
        this.screen = "full";
      }
    };
    fn();
    on(window, 'resize', fn)
    // 记得销毁一些全局的的事件
    this.$once("hook:beforeDestroy", () => {
      off(window, 'resize', fn)
    });
  },
};