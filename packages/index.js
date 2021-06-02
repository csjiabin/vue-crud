import * as components from "./components";
// import * as store from "./store";
const install = function (Vue, options = {}) {
  if (install.installed) return;
  const { crud = {} } = options;
  // 样式
  if (!crud.style) crud.style = {};
  // 缓存配置
  Vue.prototype.$__crud = crud;
  Vue.prototype.$__vue = Vue;
  Vue.prototype.$__inst = new Vue();
  // // eslint-disable-next-line no-undef
  // store.__crud = crud;
  // // eslint-disable-next-line no-undef
  // store.__vue = Vue;
  // // eslint-disable-next-line no-undef
  // store.__inst = new Vue();
  // 注册组件
  for (let i in components) {
    Vue.use(components[i]);
  }
  // components.map((component) => {
  //   Vue.use(component);
  // });
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
