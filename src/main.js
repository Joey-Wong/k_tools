import { createApp } from "vue";
import App from "./App.vue";
import router from "./routes";
import ev from "./event";
const app = createApp(App);
app.use(router);
app.use(ev);
app.mount("#app");
