"use strict";
import { log, getResourcesDir } from "@/main-render/utils";
import { app, protocol, BrowserWindow, Menu, Tray, session } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import path from "path";
import { machineIdSync } from "node-machine-id";
import "@/main-render/messageBrage/handle.js";
// 捕获未处理的同步异常

const isDevelopment = process.env.NODE_ENV !== "production";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { secure: true, standard: true } }]);

const afterWinCreated = () => {
  // 创建系统托盘图标
  const iconPath = `${getResourcesDir()}/k_tools.png`;
  const tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "显示主界面",
      click: () => {
        win.show();
      },
    },
    {
      label: "退出应用",
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setToolTip("k_tools");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    win.isVisible() ? win.hide() : win.show();
  });

  tray.on("right-click", () => {
    tray.popUpContextMenu();
  });
  win.on("minimize", function (event) {
    event.preventDefault();
    win.hide();
  });
};

let win = null;
async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 900,
    minHeight: 700,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true, // process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: true, //!process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true,
      webSecurity: false,
      webgl: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  win.setMenu(null); // 隐藏顶部菜单
  global.win = win;
  afterWinCreated();
  // win.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
const beforeAppStart = async () => {
  // 获取默认会话
  const sourceConsoleLog = console.log;
  console.log = (msg) => {
    sourceConsoleLog(msg);
    if (log && log instanceof Function) {
      log(msg);
    }
  };

  global.pathSep = path.sep;
  global.appPath = path.dirname(app.getPath("exe")).split(path.sep).join("/");
  global.uuid = machineIdSync();
  console.log("[beforeAppStart]", Date.now());
  // 捕获未处理的同步异常
  process.on("uncaughtException", (error) => {
    console.log(error.message);
    // 可以选择退出进程
    // process.exit(1);
  });

  // 捕获未处理的 Promise 拒绝
  process.on("unhandledRejection", (reason, promise) => {
    console.log(reason.message);
  });
};

// 尝试获取单实例锁
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  // 如果获取锁失败，说明已有实例在运行，退出当前实例
  app.quit();
} else {
  // 当第二个实例启动时，会触发 'second-instance' 事件
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时，将焦点聚焦到主窗口
    if (win) {
      if (!win.isVisible()) {
        win.show();
      }
      win.focus();
    }
  });

  // Quit when all windows are closed.
  app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
  app.commandLine.appendSwitch("--ignore-certificate-errors", "true");
  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on("ready", async () => {
    try {
      await beforeAppStart();
    } catch (e) {
      console.error("Before App Start Erro:", e.toString());
    }
    if (isDevelopment && !process.env.IS_TEST) {
      // Install Vue Devtools
      try {
        await installExtension(VUEJS3_DEVTOOLS);
      } catch (e) {
        console.error("Vue Devtools failed to install:", e.toString());
      }
    }
    createWindow();
  });

  // Exit cleanly on request from parent process in development mode.
  if (isDevelopment) {
    if (process.platform === "win32") {
      process.on("message", (data) => {
        if (data === "graceful-exit") {
          app.quit();
        }
      });
    } else {
      process.on("SIGTERM", () => {
        app.quit();
      });
    }
  }
}
