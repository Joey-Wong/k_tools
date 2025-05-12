import { getFileMD5, to, getFiles } from "@/main-render/utils";
const fs = require("fs");

const batchDelSameFile = async ({ sourceDir, isDeep }) => {
  const startTime = Date.now();
  const map = {};
  const filesList = getFiles(sourceDir, isDeep);
  for (let item of filesList) {
    const [err, md5] = await to(getFileMD5({ file: item }));
    if (!err && md5) {
      const Log = `[${md5}]:${item}<br/>`;
      const res = {
        Code: !err ? 0 : -1,
        Msg: err,
        Done: false,
        Log,
      };

      global.win.webContents.send("BatchDelSameFile", JSON.stringify(res));

      map[md5] = map[md5] ? [...map[md5], item] : [item];
    }
  }
  const kes = Object.keys(map);
  let delFileCount = 0;
  kes.forEach((item) => {
    const len = map[item].length;
    if (len > 1) {
      let index = 1;
      while (index < len) {
        delFileCount++;
        const Log = `[Del]:${map[item][index]}<br/>`;
        const res = {
          Code: 0,
          Msg: "",
          Done: false,
          Log,
        };
        global.win.webContents.send("BatchDelSameFile", JSON.stringify(res));

        fs.unlinkSync(map[item][index]);
        index++;
      }
    }
  });
  let usedTime = Date.now() - startTime;
  usedTime = usedTime < 1000 ? `${usedTime}毫秒` : `${usedTime / 1000}秒`;
  const Log = `[已完成]本次共扫描${filesList.length}个文件,删除${delFileCount}个重复文件,耗时${usedTime}.<br/>`;
  const res = {
    Code: 0,
    Msg: "",
    Done: true,
    Log,
  };
  global.win.webContents.send("BatchDelSameFile", JSON.stringify(res));
};

export default batchDelSameFile;
