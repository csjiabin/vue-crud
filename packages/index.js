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

  // 注册组件
  for (let name in components) {
    Vue.use(components[name]);
  }
};
//  全局引用可自动安装
if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default {
  version: '__VERSION__',
  install,
  components
};
