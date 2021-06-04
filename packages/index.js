import * as components from "./components";
// import * as store from "./store";
const install = function (Vue, options = {}) {
  if (install.installed) return;
  const { crud = {} } = options;
  // 样式
  if (!crud.style) crud.style = {};
  // 缓存配置
  Vue.prototype.$_crud = crud;
  Vue.prototype.$_vue = Vue;
  Vue.prototype.$_inst = new Vue();
  // 注册组件
  for (let i in components) {
    Vue.use(components[i]);
  }
};
//  全局引用可自动安装
if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}
export default {
  version: "__VERSION__",
  install,
};

export { components };
