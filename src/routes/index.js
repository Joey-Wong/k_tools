import { createRouter, createWebHashHistory } from "vue-router";
import routes from "./config";
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
