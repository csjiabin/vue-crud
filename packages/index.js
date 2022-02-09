import components from "./components";
// import { getInstance } from "vue-el-crud/utils";
// import { contextMenu } from "vue-el-crud/directives";

const install = function (Vue, options = {}) {
  const inst = new Vue()
  // 缓存配置
  // 获取组件实例
  // const Form = getInstance(components.form);

  Vue.prototype.$crud = {
    options,
    vue: Vue,
    inst,
    emit: inst.$emit,
    // openForm: Form.open,
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
