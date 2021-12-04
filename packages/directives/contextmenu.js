import ContextMenu from "../components/context-menu";
import { on, off } from "../utils/index";
function handleContextMenu(el, binding) {
  return function (e) {
    const instance = el._contextMenu
    instance.open(e, { list: binding.value || [] })
  }
};
export default {
  inserted(el, binding) {
    el._contextMenu = ContextMenu.instance
    const onContextMenu = handleContextMenu(el, binding);
    on(el, 'contextmenu', onContextMenu)
    el._onContextMenu = onContextMenu;
  },
  unbind(el) {
    if (!el._onContextMenu) return;
    off(el, 'contextmenu', el._onContextMenu)
    delete el._onContextMenu;
  },
}