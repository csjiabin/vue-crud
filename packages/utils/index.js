import Vue from "vue";
import cloneDeep from "clone-deep";
import flat from "array.prototype.flat";

import get from './get'

export { cloneDeep, flat, get };

const toString = Object.prototype.toString;

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
export function getTag(value) {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]'
  }
  return toString.call(value)
}


export function isSymbol(value) {
  const type = typeof value
  return type == 'symbol' || (type === 'object' && value != null && getTag(value) == '[object Symbol]')
}


export function isArray(value) {
  if (typeof Array.isArray === "function") {
    return Array.isArray(value);
  } else {
    return toString.call(value) === "[object Array]";
  }
}
export function isObject(value) {
  return toString.call(value) === "[object Object]";
}

export function isNumber(value) {
  return !isNaN(Number(value));
}

export function isFunction(value) {
  return typeof value === "function";
}

export function isString(value) {
  return typeof value === "string";
}

export function isBoolean(value) {
  return typeof value === "boolean";
}

export function isNull(value) {
  return value === null;
}

export function isUndefined(value) {
  return value === undefined
}

export function isEmpty(value) {
  if (isArray(value)) {
    return value.length === 0;
  }

  if (isObject(value)) {
    return Object.keys(value).length === 0;
  }

  return value === "" || isUndefined(value) || isNull(value);
}

export function clone(obj) {
  return Object.create(
    Object.getPrototypeOf(obj),
    Object.getOwnPropertyDescriptors(obj)
  );
}

export function getParent(name) {
  let parent = this.$parent;

  while (parent) {
    if (parent.$options.name !== name) {
      parent = parent.$parent;
    } else {
      return parent;
    }
  }
  return null;
}

export function dataset(obj, key, value) {
  const isGet = value === undefined;
  let d = obj;

  let arr = flat(
    key.split(".").map((e) => {
      if (e.includes("[")) {
        return e.split("[").map((e) => e.replace(/"/g, ""));
      } else {
        return e;
      }
    })
  );

  try {
    for (let i = 0; i < arr.length; i++) {
      let e = arr[i];
      let n = null;

      if (e.includes("]")) {
        let [k, v] = e.replace("]", "").split(":");

        if (v) {
          n = d.findIndex((x) => x[k] == v);
        } else {
          n = Number(n);
        }
      } else {
        n = e;
      }

      if (i != arr.length - 1) {
        d = d[n];
      } else {
        if (isGet) {
          return d[n];
        } else {
          Vue.set(d, n, value);
        }
      }
    }

    return obj;
  } catch (e) {
    console.error("格式错误", `${key}`);
    return {};
  }
}

export function deepMerge(a, b) {
  let k;
  for (k in b) {
    a[k] =
      a[k] && a[k].toString() === "[object Object]"
        ? deepMerge(a[k], b[k])
        : (a[k] = b[k]);
  }
  return a;
}

export function contains(parent, node) {
  if (document.documentElement.contains) {
    return parent !== node && parent.contains(node);
  } else {
    while (node && (node = node.parentNode)) if (node === parent) return true;
    return false;
  }
}

export function getInstance(component, vue) {
  const ComponentConstructor = vue.extend(component);
  return new ComponentConstructor({
    el: document.createElement("div"),
  });
}
/**
 * @param {HTMLElement} element
 * @param {string} event
 * @param {function} handler
 * @param {boolean | AddEventListenerOptions} options?
 */
export const on = (function () {
  if (document.addEventListener) {
    return function (element, event, handler, options = false) {
      if (element && event && handler) {
        element.addEventListener(event, handler, options);
      }
    };
  } else {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.attachEvent("on" + event, handler);
      }
    };
  }
})();
/**
 * @param {HTMLElement} element
 * @param {string} event
 * @param {function} handler
 * @param {boolean | AddEventListenerOptions} options?
 */
export const off = (function () {
  if (document.removeEventListener) {
    return function (element, event, handler, options = false) {
      if (element && event) {
        element.removeEventListener(event, handler, options);
      }
    };
  } else {
    return function (element, event, handler) {
      if (element && event) {
        element.detachEvent("on" + event, handler);
      }
    };
  }
})();

/**
 * @param {HTMLElement} el
 * @param {string} event
 * @param {function} fn
 */
export const once = function (el, event, fn) {
  const listener = function () {
    if (fn) {
      fn.apply(this, arguments);
    }
    off(el, event, listener);
  };
  on(el, event, listener);
};

/**
 * 解析 hidden 参数的几个场景
 * @param {string} method
 * @param {function({ value, scope, data = {} })} fn
 */
export function parse(method, { value, scope, data = {} }) {
  if (method === "hidden") {
    if (isBoolean(value)) {
      return value;
    } else if (isString(value)) {
      const prop = value.substring(1, value.length);

      switch (value[0]) {
        case "@":
          return !scope[prop];
        case ":":
          return data[prop];
      }
    } else if (isFunction(value)) {
      return value({ scope, ...data });
    }
    return false;
  }
}

// -转小驼峰
export function toHump(name) {
  return name.replace(/\-(\w)/g, (_, letter) => letter.toUpperCase());
}

// 驼峰转换横杠
export function toLine(name) {
  return name.replace(/([A-Z])/g, "-$1").toLowerCase();
}

