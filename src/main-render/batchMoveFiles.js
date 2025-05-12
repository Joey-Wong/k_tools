import { getFiles } from "@/main-render/utils";
import fs from "fs";

const isNeedMove = (isUseReg, fileNameReg, fileName) => {
  let isHit = false;
  if (isUseReg) {
    let regText = fileNameReg;
    if (regText[0] === "/") {
      regText = regText.substring(1);
    }
    if (regText[regText.length - 1] === "/") {
      regText = regText.substring(0, regText.length - 1);
    }
    const reg = new RegExp(regText);
    isHit = reg.test(fileName);
  } else {
    isHit = fileName.indexOf(fileNameReg) > -1;
  }
  return isHit;
};

const checkFileExistsSync = (filePath) => {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true; // 文件存在
  } catch (error) {
    if (error.code === "ENOENT") {
      return false; // 文件不存在
    }
    throw error; // 其他错误（如权限不足）
  }
};

const moveFiles = async ({ sourceDir, targetDir, fileNameReg, isUseReg, isDeep }) => {
  const startTime = Date.now();
  const filesList = getFiles(sourceDir, isDeep);
  let fileName = "";
  let count = 0;
  let successCount = 0;
  let failCount = 0;
  for (let item of filesList) {
    fileName = item.substring(item.lastIndexOf("/") + 1);
    if (isNeedMove(isUseReg, fileNameReg, fileName)) {
      count++;
      try {
        // 文件名存在重命名
        let resFileName = fileName;
        let i = 0;
        while (checkFileExistsSync(`${targetDir}/${resFileName}`)) {
          i++;
          resFileName = `${i}_${fileName}`;
        }
        fs.renameSync(item, `${targetDir}/${resFileName}`);

        const res = {
          Code: 0,
          Done: false,
          Log: `[正在移动文件]${fileName}`,
        };
        global.win.webContents.send("BatchMoveFiles", JSON.stringify(res));
        successCount++;
      } catch (err) {
        failCount++;
        const res = {
          Code: -1,
          Done: false,
          Msg: `移动文件${item}发生错误 ${err}`,
        };
        global.win.webContents.send("BatchMoveFiles", JSON.stringify(res));
      }
    }
  }
  let usedTime = Date.now() - startTime;
  usedTime = usedTime < 1000 ? `${usedTime}毫秒` : `${usedTime / 1000}秒`;

  const res = {
    Code: 0,
    Done: true,
    Log: `[文件移动完成]本次共移动[${count}]个文件,成功[${successCount}]个,失败[${failCount}]个,耗时${usedTime}.<br/>`,
  };
  global.win.webContents.send("BatchMoveFiles", JSON.stringify(res));
};

export default moveFiles;
