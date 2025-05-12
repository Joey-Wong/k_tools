import { getFiles } from "@/main-render/utils";
const fs = require("fs");

const batchRenameFiles = async ({ sourceDir, isDeep, selectedRule, addContent, isUseReg, regFind, regReplace }) => {
  let renameMode = selectedRule;
  let addCount = 1;
  let reg = null;
  if (isUseReg) {
    renameMode = "-1";
    reg = new RegExp(regFind);
  }

  const startTime = Date.now();
  const filesList = getFiles(sourceDir, isDeep);
  filesList.forEach((item) => {
    const splitIndex = item.lastIndexOf("/");
    const sourceDir = item.substring(0, splitIndex);
    const soueceFileName = item.substring(splitIndex + 1);
    let resFileName = "";
    if (renameMode === "-1") {
      resFileName = soueceFileName.replace(reg, regReplace);
    } else if (renameMode === "0") {
      resFileName = `${addContent}${soueceFileName}`;
    } else if (renameMode === "1") {
      const pointIndex = soueceFileName.lastIndexOf(".");
      if (pointIndex < 0) {
        resFileName = `${soueceFileName}${addContent}`;
      } else {
        const fileName = soueceFileName.substring(0, pointIndex);
        const ext = soueceFileName.substring(pointIndex + 1);
        resFileName = `${fileName}${addContent}.${ext}`;
      }
    } else if (renameMode === "2") {
      resFileName = `${soueceFileName}${addContent}`;
    } else if (renameMode === "3") {
      resFileName = `${addCount}${soueceFileName}`;
      addCount++;
    }

    const targetFilePath = `${sourceDir}/${resFileName}`;

    fs.renameSync(item, targetFilePath);

    const Log = `[${item}] >>>> [${targetFilePath}]`;
    const res = {
      Code: 0,
      Done: false,
      Log,
    };

    global.win.webContents.send("BatchRenameFiles", JSON.stringify(res));
  });

  let usedTime = Date.now() - startTime;
  usedTime = usedTime < 1000 ? `${usedTime}毫秒` : `${usedTime / 1000}秒`;

  const Log = `[已完成]本次共重命名${filesList.length}个文件,耗时${usedTime}.<br/>`;
  const res = {
    Code: 0,
    Done: true,
    Log,
  };

  global.win.webContents.send("BatchRenameFiles", JSON.stringify(res));
};

export default batchRenameFiles;
