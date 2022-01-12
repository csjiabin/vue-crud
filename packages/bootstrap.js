import { deepMerge, isFunction } from "./utils";


export default (self) => {
  const { conf, refresh, event, id, fn } = self;

  const ctx = (data) => {
    deepMerge(self, data);
    return ctx;
  };

  ctx.id = id;

  ctx.refresh = (d) => {
    return isFunction(d) ? d(self.params, refresh) : refresh(d);
  }

  ctx.conf = (d) => {
    deepMerge(conf, d);
    return ctx;
  };

  ctx.service = (d) => {
    self.service = d;
    if (fn.permission) {
      self.permission = fn.permission(self);
    }
    return ctx;
  };

  ctx.permission = (x) => {
    if (isFunction(x)) {
      self.permission = x(self);
    } else {
      deepMerge(self.permission, x);
    }
    return ctx;
  };

  ctx.set = (key, value) => {
    deepMerge(self[key], value);
    return ctx;
  };

  ["on", "once"].forEach((n) => {
    ctx[n] = (name, cb) => {
      event[name] = {
        mode: n,
        callback: cb
      };
      return ctx;
    };
  });

  ctx.done = () => {
    self.done();
    return ctx;
  };

  return ctx;
};
