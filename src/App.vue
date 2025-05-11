<template>
  <n-message-provider :max="1">
    <div id="root-app">
      <Layout />
      <div class="menu-content-wrap">
        <router-view />
      </div>
    </div>
  </n-message-provider>
</template>

<script>
import { NMessageProvider } from "naive-ui";
import Layout from "@/components/Layout";
export default {
  name: "App",
  components: {
    NMessageProvider,
    Layout,
  },
};
</script>
<style lang="less">
.tip {
  color: #999;
  span {
    background-color: #eee;
    border-radius: 4px;
    color: chocolate;
    display: inline-block;
    padding: 0 6px;
  }
}
</style>
<style lang="less" scoped>
#root-app {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: space-between;
}
.menu-content-wrap {
  background-color: #fff;
  padding: 10px;
  height: 100vh;
  flex-grow: 1;
}
</style>
