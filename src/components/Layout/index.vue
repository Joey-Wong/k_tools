<template>
  <div class="layout">
    <div class="menu-wrap">
      <div
        v-for="(item, index) in ListMenuItem"
        :key="index"
        @click="goMenu(item)"
        :class="['menu', selectedMenuItem.key === item.key ? 'active-menu' : '']"
      >
        {{ item.title }}
      </div>
    </div>
    <div class="support-wrap">
      <div class="img-wrap"><img @click="donate()" :src="imgs.supportIcon" /></div>
      <div class="version" @click="openDevTools()">
        <span>version: {{ packageJson.version }}</span>
      </div>
      <div class="download-progress" v-show="isShowDownloadBox && !userNotClose">
        <span>正在更新: {{ parseInt((curDownloadSize * 100) / fileSize) }}%</span>
        <n-progress
          :height="4"
          type="line"
          :show-indicator="false"
          status="success"
          :percentage="parseInt((curDownloadSize * 100) / fileSize)"
        />
      </div>
    </div>
    <n-modal v-model:show="isShowDonateBox" preset="dialog" title="支持一下 随意打赏">
      <div class="donate-box">
        <div class="select-img">
          <span :class="[selectedDonateMethod === 1 ? 'active' : '']" @click="showDonateImag(1)">支付宝</span>
          <span :class="[selectedDonateMethod === 2 ? 'active' : '']" @click="showDonateImag(2)">微信</span>
        </div>
        <img :src="selectedDonateMethod === 1 ? imgs.zhifupay : imgs.wechatpay" />
        <p>如果觉得该软件还不错就支持一下作者吧</p>
        <p></p>
        <p>QQ:511212586</p>
      </div>
    </n-modal>
    <n-modal
      v-model:show="isShowUpdateBox"
      :mask-closable="false"
      preset="dialog"
      title="软件更新"
      :content="content"
      positive-text="下载更新"
      negative-text="取消"
      @positive-click="download"
      @negative-click="cancle"
    />
    <n-modal
      v-model:show="isShowInstallBox"
      :mask-closable="false"
      preset="dialog"
      title="软件更新"
      content="新版软件已下载完成,是否现在安装?"
      positive-text="现在安装"
      negative-text="下次启动时安装"
      @positive-click="install(0)"
      @negative-click="install(1)"
    />
    <n-modal
      :closable="false"
      :show="isShowDownloadBox && userNotClose"
      :mask-closable="false"
      preset="dialog"
      title="正在下载"
      negative-text="后台下载"
      @negative-click="downloadBackEnd()"
    >
      <div class="download-progress">
        <n-progress
          type="circle"
          :percentage="parseInt((curDownloadSize * 100) / fileSize)"
          color="#18a058"
          rail-color="rgba(24,160,88,.2)"
          indicator-text-color="#18a058"
        />
        <p class="tip">正在下载:{{ (curDownloadSize / 1048576).toFixed(2) }}M/{{ (fileSize / 1048576).toFixed(2) }}M</p>
      </div>
    </n-modal>
  </div>
</template>

<script>
import { NModal, NProgress } from "naive-ui";
import packageJson from "@/../package.json";
import { to } from "@/utils";
export default {
  name: "Layout",
  components: {
    NModal,
    NProgress,
  },
  data() {
    return {
      openDevToolsCount: 0,
      packageJson,
      userNotClose: true,
      isShowDownloadBox: false,
      fileSize: 1, // 文件总大小
      curDownloadSize: 0, // 已下载文件大小
      content: "1",
      isShowInstallBox: false,
      isShowUpdateBox: false,
      isShowDonateBox: false,
      downloadSrc: "",
      hash: "",
      selectedDonateMethod: 1,
      updateInfo: {},
      imgs: {
        zhifupay: require("@/assets/imgs/zhifupay.png"),
        wechatpay: require("@/assets/imgs/wechatpay.png"),
        supportIcon: require("@/assets/imgs/support.png"),
      },
      ListMenuItem: [
        {
          title: "计算文件MD5",
          key: "getFileMD5",
        },
        {
          title: "文件查重与删除",
          key: "delSameFiles",
        },
        {
          title: "批量移动文件",
          key: "moveFiles",
        },
        {
          title: "批量重命名文件",
          key: "batchRenameFiles",
        },
      ],
      selectedMenuItem: {
        title: "计算文件MD5",
        key: "getFileMD5",
      },
    };
  },
  async mounted() {
    // ipcRenderer.on("Update", this.getUpdateRes);

    const localVersion = packageJson.version.split("."); // x.x.x
    const random = Math.random();
    const [error, response] = await to(fetch(`http://localhost:3000/update.json?random=${random}`));
    if (error) {
      console.log("error", error);
      this.isShowDonateBox = true;
      return false;
    }
    const data = await response.json();

    if (!data || !data.version) {
      this.isShowDonateBox = true;
      return false;
    }
    const newVersion = data.version.split(".");
    if (this.compareVersion(newVersion, localVersion)) {
      this.downloadSrc = data.downloadSrc;
      this.updateInfo = data;
      this.content = `当前软件版本[${packageJson.version}],检测到新版本[${data.version}],是否更新?`;
      const params = {
        type: "0", // 0-检测本地是否有新安装包 1-远端下载新包 2-
        ...this.updateInfo,
      };
      this.log = "";
      ipcRenderer.send("Update", JSON.stringify(params));
    } else {
      this.isShowDonateBox = true;
    }
  },
  methods: {
    openDevTools() {
      this.openDevToolsCount++;
      if (this.openDevToolsCount === 7) {
        ipcRenderer.invoke("OpenDevTools");
        setTimeout(() => {
          this.openDevToolsCount = 0;
        }, 500);
      }
    },
    downloadBackEnd() {
      this.userNotClose = false;
    },
    userClose() {
      this.userNotClose = false;
    },
    compareVersion(v1, v2) {
      if (v1[0] > v2[0]) {
        return true;
      }
      if (v1[0] === v2[0] && v1[1] > v2[1]) {
        return true;
      }
      if (v1[0] === v2[0] && v1[1] === v2[1] && v1[2] > v2[2]) {
        return true;
      }
      return false;
    },
    cancle() {
      this.isShowUpdateBox = false;
    },
    download() {
      // TODO 下载新安装包
      const params = {
        type: "1", // 0-检测本地是否有新安装包 1-远端下载新包 2-现在安装
        ...this.updateInfo,
      };
      ipcRenderer.send("Update", JSON.stringify(params));
      this.isShowUpdateBox = false;
    },
    install(v) {
      this.isShowInstallBox = false;
      setTimeout(() => {
        if (v === 0) {
          // 现在安装
          const params = {
            type: "2", // 0-检测本地是否有新安装包 1-远端下载新包 2-现在安装
            ...this.updateInfo,
          };
          ipcRenderer.send("Update", JSON.stringify(params));
        }
      }, 500);
    },
    getUpdateRes(event, rsp) {
      const res = JSON.parse(rsp);
      const {
        RspHeader: { IsSuccess, Msg },
        RspBody: {
          exist,
          type,
          code, // 0-下载文件保存成功 1-下载结束 2-当前进度 3-下载失败
          fileSize, // 文件总大小
          curDownloadSize, // 已下载文件大小
        },
      } = res;

      if (!IsSuccess) {
        window.$message.error(Msg);
        return false;
      }
      if (type === "0" && !exist) {
        // 有新版但本地没下载
        this.isShowUpdateBox = true;
        return false;
      }
      if (type === "1" && code === 0) {
        // 新版下载好了
        this.isShowInstallBox = true;
        this.isShowDownloadBox = false;
      }
      if (type === "1" && code === 2) {
        this.isShowDownloadBox = true;
        // 新版下载好了
        this.curDownloadSize = curDownloadSize;
        this.fileSize = fileSize;
      }
    },
    goMenu(item) {
      if (this.selectedMenuItem.key === item.key) {
        return false;
      }
      this.selectedMenuItem = item;
      this.$router.replace({ path: `/${item.key}` });
    },
    donate() {
      this.isShowDonateBox = true;
    },
    showDonateImag(type) {
      this.selectedDonateMethod = type;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.layout {
  background-color: #f8f9f9;
  width: 160px;
  min-width: 160px;
  max-width: 160px;
  padding: 10px;
  height: 100vh;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.menu {
  padding: 6px 10px;
  width: 100%;
  margin-bottom: 10px;
  background-color: #ebeded;
  border-radius: 4px;
  color: #64a5aa;
  cursor: pointer;
}
.active-menu {
  color: #fff;
  background-color: #64a5aa;
}

.support-wrap {
  .img-wrap {
    display: flex;
    justify-content: flex-end;
    img {
      width: 20px;
      cursor: pointer;
    }
  }
  .version {
    span {
      text-align: left;
      width: 100%;
      display: inline-block;
      font-size: 12px;
      color: rgb(153, 153, 153);
    }
  }
  .download-progress {
    span {
      text-align: left;
      width: 100%;
      display: inline-block;
      font-size: 12px;
      color: rgb(153, 153, 153);
    }
  }
}

.donate-box {
  width: 330px;
  margin-left: auto;
  margin-right: auto;
  .select-img {
    width: 100%;
    height: 33px;
    border-bottom: 1px solid #ebebeb;
    margin-top: 20px;
    padding-left: 70px;
    padding-right: 70px;
    display: flex;
    justify-content: space-between;
    span {
      display: inline-block;
      height: 33px;
      font-size: 14px;
      color: rgb(153, 153, 153);
      cursor: pointer;
      &.active {
        border-bottom: 2px solid rgb(51, 51, 51);
        color: rgb(51, 51, 51);
      }
    }
  }
  img {
    width: 220px;
    height: 220px;
    display: block;
    margin-top: 25px;
    margin-bottom: 20px;
    margin-left: auto;
    margin-right: auto;
  }
  p {
    color: #ababab;
    font-size: 14px;
  }
}
.download-progress {
  display: flex;
  align-items: center;
  flex-direction: column;
}
</style>
