import { on, off } from "../utils/index";
export default {
  inserted(el, binding) {
    const callback = binding.value;
    const options = binding.options || { passive: true };

    on(window, 'resize', callback, options)
    el._onResize = {
      callback,
      options,
    };

    if (!binding.modifiers || !binding.modifiers.quiet) {
      callback();
    }
  },
  unbind(el) {
    if (!el._onResize) return;
    const { callback, options } = el._onResize;
    off(window, 'resize', callback, options)
    delete el._onResize;
  },
};