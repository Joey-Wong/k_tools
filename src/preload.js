import { ipcRenderer, contextBridge } from "electron";
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  removeListener(...args) {
    const [channel, listener] = args;
    return ipcRenderer.removeListener(channel, listener);
  },
  once(...args) {
    const [channel, listener] = args;
    return ipcRenderer.once(channel, (event, ...args) => listener(event, ...args));
  },
  removeAllListeners(...args) {
    const [channel] = args;
    return ipcRenderer.removeAllListeners(channel);
  },
  off(...args) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
});
