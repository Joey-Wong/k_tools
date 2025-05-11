const common = {
  data() {
    return {
      path: null,
      sourceDir: "", // 源目录
      targetDir: "", // 目标目录
      sourceFilePath: "", // 源文件
      sourceFileName: "", // 源文件名
      Done: false, // 是否执行完成
      progressing: false, // 在执行中
    };
  },
  methods: {
    async choseDir(v) {
      const [error, files] = await window.ipcRenderer.invoke("ShowOpenDialog", {
        properties: ["openDirectory"],
      });
      if (error) {
        return false;
      }
      if (files && files.filePaths && files.filePaths[0]) {
        const dir = files.filePaths[0];
        if (!v) {
          this.sourceDir = dir.replaceAll("\\", "/");
        } else {
          this[v] = dir.replaceAll("\\", "/");
        }
      }
    },
    async choseFile(v, fileNameFiled) {
      const [error, files] = await window.ipcRenderer.invoke("ShowOpenDialog");
      if (error) {
        return false;
      }
      if (files && files.filePaths && files.filePaths[0]) {
        const filePath = files.filePaths[0];
        const tmpFilePath = filePath.replaceAll("\\", "/");
        const tmpfileName = tmpFilePath.substring(tmpFilePath.lastIndexOf("/") + 1);
        if (!v) {
          this.sourceFilePath = tmpFilePath;
          this.sourceFileName = tmpfileName;
        } else {
          this[v] = tmpFilePath;
          this[fileNameFiled] = tmpfileName;
        }
      }
    },
  },
};

export default common;
