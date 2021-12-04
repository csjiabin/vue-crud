import components from "./components";
const install = function (Vue, options = {}) {
  // 样式
  if (!options.style) options.style = {};
  // 表格
  if (!options.table) options.table = {};

  // 缓存配置
  Vue.prototype.$crud = {
    options,
    vue: Vue,
    inst: new Vue(),
    components
  }
  // 缓存配置
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
  version: '__VERSION__',
  install,
};
