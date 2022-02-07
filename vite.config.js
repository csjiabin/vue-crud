import * as path from 'path'
import { defineConfig, loadEnv } from 'vite'
import { createVuePlugin } from "vite-plugin-vue2";
import vitePluginImp from 'vite-plugin-imp'
import { replaceCodePlugin } from "vite-plugin-replace";
import { version } from "./package.json";
// const banner =
//   "\n/*!\n" +
//   ` * vue-crud v${version}\n` +
//   ` * (c) 2021-${new Date().getFullYear()} Evan You\n` +
//   " * Released under the MIT License.\n" +
//   " */\n";
// https://vitejs.dev/config/
let buildOptions = {
  // 设置最终构建的浏览器兼容目标（默认值是‘modules’）
  target: 'es2015',
  // 指定输出路径,默认是dist
  outDir: 'lib',
  // 压缩
  minify: "esbuild",
  // 进行压缩计算
  brotliSize: true,
  lib: {
    entry: path.resolve(__dirname, 'packages/index.js'),
    name: 'VueCrud',
    fileName: (format) => `index.${format}.js`
  },
  rollupOptions: {
    // input: {
    //   default: './index.html'
    // },
    // 确保外部化处理那些你不想打包进库的依赖
    external: ['vue', 'element-ui'],
    output: {
      // banner,
      // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
      globals: {
        vue: 'Vue',
        // ELEMENT: "ElementUI",
        'element-ui': "ElementUI"
      }
    }
  }
}

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  console.log({ mode, command, env });
  if (env.VITE_ENV == 'demo') {
    delete buildOptions.lib
    delete buildOptions.outDir
    buildOptions.rollupOptions = {
      output: {
        manualChunks: {
          vue: ['vue'],
          elementUI: ['element-ui'],
        }
      }
    }
  }
  return {
    ssr: false,
    plugins: [
      createVuePlugin({ jsx: true }),
      vitePluginImp({
        libList: [require('autoprefixer')]
      }),
      replaceCodePlugin({
        replacements: [
          {
            from: /__VERSION__/g,
            to: version,
          },
        ]
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'vue-crud': path.resolve(__dirname, './packages')
      }
    },
    css: {
      postcss: {
        plugins: [
          require('autoprefixer'),
          {
            // warning: "@charset" must be the first rule in the file
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              }
            }
          }
        ],
      }
    },
    build: buildOptions
  }
})
