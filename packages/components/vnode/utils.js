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
 * @param {*} vnode vnode 属性
 * @param {{scope,prop,vm}} options
 * @returns VNode ||VNode[]||undefined
 */
export const renderNode = (vnode, { prop, scope, vm }) => {
  const h = vm.$createElement;
  // 判断是否为空
  if (isEmpty(vnode)) return;
  // 如果插槽存在
  let slot = vm.$scopedSlots[vnode?.name || vnode];
  // 判断是否为字符串
  if (slot) return slot(scope)
  // 判断是否为函数
  if (isFunction(vnode)) return vnode(h, scope)

  // 判断是否为Object
  if (!isObject(vnode)) return;
  let args = getNodeOptions(vnode)
  // 输入事件
  const onInput = args.on.input
  // 设置默认值
  if (prop) {
    args.attrs.value = scope[prop];
    args.props.value = scope[prop];
  }
  // console.log(args);
  // 监听输入事件
  args.on.input = (val) => {
    vm.$set(scope, prop, val);
    onInput && onInput(val)
  };


  if (elKeys.includes(vnode.name)) {
    // Append component children
    const children = (vnode.options || []).map((v, i) => {
      let label = ''
      let value = '';

      if (isString(v)) {
        label = value = v;
      } else if (isObject(v)) {
        label = v.label;
        value = v.value;
      }
      let key = value || i
      if (vnode.name === "el-select") {
        return renderNode({
          name: 'el-option',
          key,
          props: {
            label,
            value,
            ...v.props
          }
        }, { vm })
      }
      if (vnode.name === "el-radio-group") {
        return renderNode({
          name: 'el-radio',
          key,
          props: {
            label: value,
            ...v.props
          },
          children: [label]
        }, { vm })
      }
      if (vnode.name === "el-checkbox-group") {
        return renderNode({
          name: 'el-checkbox',
          key,
          props: {
            label: value,
            ...v.props
          },
          children: [label]
        }, { vm })
      }
    });
    return h(vnode.name, args, children)
  }
  // 如果有render函数
  if (vnode.render) return vnode.render(h, scope);
  // 默认$createElement方法
  return h(vnode.name, args, vnode.children);
};

const getNodeOptions = (vnode) => {
  const { name, children, attrs, on, props, ...args } = vnode;
  return {
    ...args,
    attrs: attrs || {},
    on: on || {},
    props: props || {},
  }
}