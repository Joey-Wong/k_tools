import { getFiles } from "@/main-render/utils";
const fs = require("fs");

const batchDelFiles = async ({ sourceDir, isDeep, fileNameContent, isUseReg, regFind }) => {
  let reg = null;
  let cont = 0;
  if (isUseReg) {
    reg = new RegExp(regFind);
  }

  const startTime = Date.now();
  const filesList = getFiles(sourceDir, isDeep);
  const total = filesList.length;
  filesList.forEach((item) => {
    const splitIndex = item.lastIndexOf("/");
    const soueceFileName = item.substring(splitIndex + 1);
    let isDel = false;
    if (reg) {
      isDel = reg.test(soueceFileName);
    } else {
      isDel = soueceFileName.includes(fileNameContent);
    }

    const Log = `[${item}] >>>> [${isDel ? "删除" : "保留"}]`;
    if (isDel) {
      fs.unlinkSync(item);
      cont++;
    }
    const res = {
      Code: 0,
      Done: false,
      Log,
    };
    global.win.webContents.send("BatchDelFiles", JSON.stringify(res));
  });
  let usedTime = Date.now() - startTime;
  usedTime = usedTime < 1000 ? `${usedTime}毫秒` : `${usedTime / 1000}秒`;
  const Log = `[已完成]本次共扫描${total}个文件,删除${cont}个文件,耗时${usedTime}.<br/>`;
  const res = {
    Code: 0,
    Done: true,
    Log,
  };

  global.win.webContents.send("BatchDelFiles", JSON.stringify(res));
};

export default batchDelFiles;
