import { on, off } from "../utils/index";

function defaultConditional() {
  return true;
}

function directive(e, el, binding) {
  const handler =
    typeof binding.value === "function" ? binding.value : binding.value.handler;

  const isActive =
    (typeof binding.value === "object" && binding.value.closeConditional) ||
    defaultConditional;

  if (!e || isActive(e) === false) return;

  const elements = (
    (typeof binding.value === "object" && binding.value.include) ||
    (() => [])
  )();

  elements.push(el);

  !elements.some((el) => el.contains(e.target)) &&
    setTimeout(() => {
      isActive(e) && handler && handler(e);
    }, 0);
}
export default {
  inserted(el, binding) {
    const onClick = (e) => directive(e, el, binding);

    const app =
      document.querySelector("[data-app]") || document.documentElement;
    on(app, 'click', onClick, true)
    el._clickOutside = onClick;
  },
  unbind(el) {
    if (!el._clickOutside) return;
    const app =
      document.querySelector("[data-app]") || document.documentElement;
    app && off(app, 'click', el._clickOutside, true);
    delete el._clickOutside;
  },
};