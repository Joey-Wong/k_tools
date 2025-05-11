const path = require("path");
const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    "style-resources-loader": {
      preProcessor: "less",
      patterns: [path.resolve(__dirname, "src/assets/css/public.less")],
    },
    electronBuilder: {
      customFileProtocol: "./",
      preload: "src/preload.js",
      builderOptions: {
        appId: "com.k_tools",
        productName: "k_tools", //项目名，也是生成的安装文件名，即aDemo.exe
        artifactName: "${productName}-${platform}-${arch}-${version}.${ext}",
        copyright: "Copyright © xx", //版权信息
        directories: {
          output: "./dist_electron", //输出文件路径
        },
        win: {
          //win相关配置
          icon: "./k_tools.ico", //图标，当前图标在根目录下，注意这里有两个坑
          target: [
            {
              target: "nsis", //利用nsis制作安装程序
              arch: [
                "x64", //64位
                // "ia32", //32位
              ],
            },
          ],
          // 以管理员权限运行
          requestedExecutionLevel: "requireAdministrator",
        },
        // 参数手册 https://www.electron.build/nsis#permachine
        nsis: {
          runAfterFinish: true,
          deleteAppDataOnUninstall: true,
          oneClick: false, // 是否一键安装
          perMachine: false,
          allowElevation: true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
          allowToChangeInstallationDirectory: true, // 允许修改安装目录
          installerIcon: "./k_tools.ico", // 安装图标
          uninstallerIcon: "./k_tools.ico", //卸载图标
          installerHeaderIcon: "./k_tools.ico", // 安装时头部图标
          createDesktopShortcut: true, // 创建桌面图标
          createStartMenuShortcut: true, // 创建开始菜单图标
          shortcutName: "k_tools", // 图标名称
        },
        extraResources: {
          // 拷贝静态文件到指定位置,否则打包之后出现找不到资源的问题.将整个resources目录拷贝到发布的根目录下
          // 获取静态资源路径方式：process.env.NODE_ENV !== 'production'?'./resources/xxx':process.resourcesPath + '/xxx'
          from: "./resources/",
          to: "./",
        },
        mac: {
          icon: "./k_tools.png",
          identity: null,
        },
        publish: [
          {
            provider: "generic",
            url: "https://xx.com/",
            channel: "latest",
          },
        ],
      },
    },
  },
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            mars_green: "#008d8e",
            bg_color: "#f8f8f8",
          },
          javascriptEnabled: true,
        },
      },
    },
  },
});
