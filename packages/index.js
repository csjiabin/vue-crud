import components from "./components";
const install = function (Vue, options = {}) {
  const inst = new Vue()
  // 缓存配置
  Vue.prototype.$crud = {
    options,
    vue: Vue,
    inst,
    emit: inst.$emit,
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
