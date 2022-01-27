import {
  isFunction,
  isEmpty,
  isString,
  isObject,
} from "vue-crud/utils";
// Handle general component
const elKeys = ["el-select", "el-radio-group", "el-checkbox-group"];
/**
 * 
 * @param {*} node vnode 属性
 * @param {{scope,prop,vm}} options
 * @returns VNode ||VNode[]||undefined
 */
export const renderNode = (node, { prop, scope, vm }) => {
  const h = vm.$createElement;
  // 判断是否为空
  if (isEmpty(node)) return;
  // 判断是否为字符串
  if (isString(node)) {
    let slot = vm.$scopedSlots[node];
    if (!slot) return;
    return slot(scope);
  }
  // 判断是否为函数
  if (isFunction(node)) return node(h, scope)

  // 判断是否为Object
  if (!isObject(node)) return;
  let args = getNodeOptions(node)
  if (!args.attrs) {
    args.attrs = {};
  }
  if (!args.on) {
    args.on = {};
  }

  if (!args.props) {
    args.props = {};
  }
  // 输入事件
  const onInput = args.on.input
  // 设置默认值
  args.attrs.value = scope[prop];
  // 监听输入事件
  args.on.input = (val) => {
    vm.$set(scope, prop, val);
    onInput && onInput(val)
  };

  if (elKeys.includes(node.name)) {
    // Append component children
    const children = (node.options || []).map((e, i) => {
      let label = ''
      let value = '';

      if (isString(e)) {
        label = value = e;
      } else if (isObject(e)) {
        label = e.label;
        value = e.value;
      }
      if (node.name === "el-select") {

        return h('el-option', {
          props: {
            key: value || i,
            label,
            value,
            ...e.props
          }
        })

      }
      if (node.name === "el-radio-group") {
        return h('el-radio', {
          props: {
            key: value || i,
            label: value,
            ...e.props
          }
        }, label)
      }
      if (node.name === "el-checkbox-group") {
        return h('el-checkbox', {
          props: {
            key: value || i,
            label: value,
            ...e.props
          }
        }, label)
      }
    });
    return h(node.name, args, children)
  }
  let slot = vm.$scopedSlots[node.name];
  // 如果插槽存在
  if (slot) return slot(scope);
  // 如果有render函数
  if (node.render) return node.render(h, scope);
  // 默认$createElement方法
  return h(node.name, args, node.children);
};

const getNodeOptions = (node) => {
  const { name, children, ...args } = node;
  return args
}