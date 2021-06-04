const path = require("path");

module.exports = {
  productionSourceMap: false,
  devServer: {
    overlay: {
      warnings: true,
      errors: true,
    },
  },
  // 修改默认的入口
  pages: {
    index: {
      entry: "examples/main.js",
      template: "public/index.html",
      filename: "index.html",
    },
  },
  chainWebpack: (config) => {
    // 设置环境变量
    config.plugin("define").tap((args) => {
      return args;
    });
    // vue默认@指向src目录，这里要修正为examples，另外新增一个指向packages
    config.resolve.alias
      .set("@", path.resolve("examples"))
      .set("~", path.resolve("packages"));

    // lib目录是组件库最终打包好存放的地方，不需要eslint检查
    // examples/docs是存放md文档的地方，也不需要eslint检查
    config.module
      .rule("eslint")
      .exclude.add(path.resolve("lib"))
      .end()
      .exclude.add(path.resolve("examples/docs"))
      .end();
    // packages和examples目录需要加入编译
    config.module
      .rule("js")
      .include.add(/packages/)
      .end()
      .include.add(/examples/)
      .end()
      .use("babel")
      .loader("babel-loader")
      .tap((options) => {
        // 修改它的选项...
        return options;
      });
  },
};

let arr = [1, 8, 9, 0, 2, 5, 4];
let index = [0, 1, 1, 5, 3, 3, 4, 4, 2, 4, 6];
let tel = "";
for (let i of index) {
  tel += arr[i];
}
console.log("tel -> ", tel);
