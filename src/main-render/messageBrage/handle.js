import { ipcMain } from "electron";
import { to } from "@/utils";
import { getFiles, getResourcesDir, AppID, getFileMD5, getFileSize } from "@/main-render/utils";
import BatchDelSameFile from "@/main-render/batchDelSameFile";
import BatchRenameFiles from "@/main-render/batchRenameFiles";
import BatchMoveFiles from "@/main-render/batchMoveFiles";
import BatchDelFiles from "@/main-render/batchDelFiles";
import path from "path";
import { dialog } from "electron";
import fs from "fs";
const fnMap = {
  GetFiles: async ({ dir, isDeep }) => {
    return await getFiles(dir, isDeep);
  },
  OpenDevTools: async () => {
    return global.win.webContents.openDevTools();
  },
  ShowOpenDialog: async (params) => {
    return await dialog.showOpenDialog(params);
  },
  GetPathSep: async (params) => {
    return await path.sep;
  },
  GetResourcesDir: async (params) => {
    return await getResourcesDir(params);
  },
  AppID: async (params) => {
    return await AppID(params);
  },
  GetFileMD5: async (params) => {
    return await getFileMD5(params);
  },
  GetFileSize: async (params) => {
    return await getFileSize(params);
  },
  BatchDelSameFile: async (params) => {
    return await BatchDelSameFile(params);
  },
  BatchRenameFiles: async (params) => {
    return await BatchRenameFiles(params);
  },
  BatchMoveFiles: async (params) => {
    return await BatchMoveFiles(params);
  },
  BatchDelFiles: async (params) => {
    return await BatchDelFiles(params);
  },
  WriteFile: async ({ path, data }) => {
    return await fs.writeFileSync(path, data);
  },
};
const keys = Object.keys(fnMap);
keys.forEach((k) => {
  ipcMain.handle(k, async (event, params) => {
    return await to(fnMap[k](params));
  });
});
