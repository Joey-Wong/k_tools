const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const to = (promise) => promise.then((data) => [null, data]).catch((err) => [err]);
const https = require("https");
const dayjs = require("dayjs");
const AppID = () => {
  return global.uuid;
};
const deleteDirectory = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    // 读取目录下的所有文件和子目录
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const curPath = path.join(dirPath, file);
      // 获取文件或目录的状态信息
      const stat = fs.statSync(curPath);

      if (stat.isDirectory()) {
        // 如果是目录，则递归调用删除函数
        deleteDirectory(curPath);
      } else {
        // 如果是文件，则直接删除
        fs.unlinkSync(curPath);
      }
    });

    // 删除空目录
    fs.rmdirSync(dirPath);
  }
};

const getFiles = (dir, isDeep) => {
  const files = fs.readdirSync(dir);
  const filesPath = [];
  for (let filaName of files) {
    const fPath = `${dir}/${filaName}`;
    const stats = fs.statSync(fPath);
    if (stats.isDirectory()) {
      isDeep && filesPath.push(...getFiles(fPath, isDeep));
    } else {
      filesPath.push(fPath);
    }
  }

  return filesPath;
};

const log = (msg) => {
  let file = process.env.NODE_ENV !== "production" ? "./log.txt" : `${global.appPath}/log.txt`;
  try {
    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;
    const m = fileSizeInBytes / (1024 * 1024);
    if (Number(m) > 10) {
      // 满了存一下
      fs.renameSync(file, `${global.appPath}/${dayjs().format("YYYY-MM-DD")}_log.txt`);
    }
  } catch (e) {
    //
  }

  const msgRes = `[${dayjs().format("YYYY-MM-DD HH:mm:ss")}]${msg}\n`;
  fs.appendFileSync(file, msgRes, { encoding: "utf8" });
};
/**
 * 文件下载
 * @param {*} url 下载地址
 * @param {*} dest 文件保存的路径，如：D:/download/app/ybx1.apk
 * @param {*} cb 回调函数参数1为区别哪个加试 cb(params)
 */
/*
params = {
  code, 0-下载文件保存成功 1-下载结束 2-当前进度 3-下载失败
  msg, 失败原因
  fileSize, // 文件总大小
  curDownloadSize, // 已下载文件大小
}
*/
const downloadFile = (url, dest, cb = () => {}) => {
  // 确保dest路径存在
  const file = fs.createWriteStream(dest);
  https.get(url, (res) => {
    if (res.statusCode !== 200) {
      cb({ code: 3, msg: `下载失败,错误码{response.statusCode}` });
      return false;
    }

    // 进度
    const fileSize = parseInt(res.headers["content-length"]); // 文件总长度
    let curDownloadSize = 0;
    res.on("data", (chunk) => {
      curDownloadSize += chunk.length;
      cb({ code: 2, fileSize, curDownloadSize });
    });

    res.on("end", () => {
      cb({ code: 1 });
    });

    // 超时,结束等
    file
      .on("finish", () => {
        file.close(cb({ code: 0 }));
      })
      .on("error", (err) => {
        fs.unlinkSync(dest);
        if (cb) cb({ code: 3, msg: err.message });
      });
    res.pipe(file);
  });
};

const getResourcesDir = () => {
  const dir =
    process.env.NODE_ENV !== "production"
      ? process.cwd().replaceAll("\\", "/") + "/resources"
      : process.resourcesPath.replaceAll("\\", "/");
  return dir;
};

const Crypto = (params) => {
  const { type, text, key } = params;
  if (type === "0") {
    return encrypt(text, getKeyFromString(`${key}`));
  } else {
    return decrypt(text, getKeyFromString(`${key}`));
  }
};

const getFileMD5 = ({ file }) =>
  new Promise((resolve, reject) => {
    const stream = fs.createReadStream(file);
    const hash = crypto.createHash("md5");
    stream.on("data", (chunk) => {
      hash.update(chunk, "utf8");
    });
    stream.on("end", () => {
      const md5 = hash.digest("hex");
      resolve(md5);
    });
    stream.on("error", (e) => {
      reject(e);
    });
  });

const getFileSize = ({ file }) => {
  try {
    const size = fs.statSync(file).size;
    const sizeUnit = [
      {
        size: 1024 * 1024 * 1024 * 1024,
        unit: "TB",
      },
      {
        size: 1024 * 1024 * 1024,
        unit: "GB",
      },
      {
        size: 1024 * 1024,
        unit: "MB",
      },
      {
        size: 1024,
        unit: "KB",
      },
    ];
    const sizeUnitSlected = sizeUnit.find((item) => size > item.size);
    const FileSize = sizeUnitSlected
      ? `${Number((size / sizeUnitSlected.size).toFixed(2))}${sizeUnitSlected.unit}`
      : `${size}Byte`;
    return { Code: 0, FileSize };
  } catch (e) {
    return { Code: -1, Msg: e };
  }
};

export { getFiles, to, log, downloadFile, getResourcesDir, AppID, Crypto, getFileMD5, getFileSize };
