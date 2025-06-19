const routes = [
  {
    path: "/",
    redirect: {
      name: "getFileMD5",
    },
  },
  {
    path: "/getFileMD5",
    name: "getFileMD5",
    component: () => import("@/views/GetFileMD5"),
  },
  {
    path: "/batchRenameFiles",
    name: "batchRenameFiles",
    component: () => import("@/views/BatchRenameFiles"),
  },
  {
    path: "/delSameFiles",
    name: "delSameFiles",
    component: () => import("@/views/DelSameFiles"),
  },
  {
    path: "/moveFiles",
    name: "moveFiles",
    component: () => import("@/views/MoveFiles"),
  },
  {
    path: "/getDirFiles",
    name: "getDirFiles",
    component: () => import("@/views/GetDirFiles"),
  },
];

export default routes;
