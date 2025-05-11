class EventEmit {
  constructor() {
    this._events = {};
  }

  on(eventName, callback) {
    if (!this._events[eventName]) {
      this._events[eventName] = [];
    }
    this._events[eventName].push(callback);
  }

  emit(eventName, data) {
    if (this._events[eventName]) {
      this._events[eventName].forEach((cb) => {
        cb(data);
      });
    }
  }

  // 取消订阅事件的方法
  off(eventName, callback) {
    if (this._events[eventName]) {
      // 过滤掉要取消的回调函数
      this._events[eventName] = this._events[eventName].filter((cb) => cb !== callback);
    }
  }
}

const ev = {
  install(app, options) {
    // 添加全局方法或属性
    app.config.globalProperties.$ev = new EventEmit();
  },
};

export default ev;
