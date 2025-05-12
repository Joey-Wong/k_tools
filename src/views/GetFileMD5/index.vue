<template>
  <div class="wrap">
    <h2 class="title">计算文件MD5</h2>
    <div class="content-wrap">
      <div class="row-wrap">
        <n-button :disabled="progressing" @click="selectFile()" type="primary">
          {{ sourceFileName || "选择文件" }}
        </n-button>
        <n-button
          class="margin-left-20"
          :loading="progressing"
          :disabled="progressing"
          v-show="sourceFileName"
          type="primary"
          @click="compute()"
        >
          {{ progressing ? "计算中..." : "开始计算" }}
        </n-button>
      </div>
      <div v-show="progressing || Done" class="compute-status">
        <p>文件名: {{ sourceFileName }}</p>
        <p>文件路径: {{ sourceFilePath }}</p>
        <p>文件大小: {{ fileSize }}</p>
        <p>当前状态: {{ progressing ? "正在计算中" : "已完成计算" }}</p>
        <p>用时: {{ usedTimeText }}</p>
      </div>
      <div v-show="Done" class="row-wrap">
        <n-button>{{ fileMD5 }}</n-button>
        <n-button class="margin-left-20" type="primary" @click="copy()">复制MD5</n-button>
        <input ref="copy-input" type="text" v-model="fileMD5" hidden readonly />
      </div>
    </div>
  </div>
</template>

<script>
import { NButton, useMessage } from "naive-ui";
import common from "@/mixins/common";

export default {
  name: "GetFileMD5",
  mixins: [common],
  components: {
    NButton,
  },
  setup() {
    window.$message = useMessage();
  },
  data() {
    return {
      fileSize: "",
      usedTime: 0,
      usedTimeText: "",
      startTime: 0,
      fileMD5: "",
    };
  },
  methods: {
    async selectFile() {
      await this.choseFile();
      this.Done = false;
      this.progressing = false;
      this.usedTime = 0;
      this.usedTimeText = "";
      this.fileSize = "";
    },
    compute() {
      this.getFileMD5();
      this.getFileSize();
    },
    async getFileMD5() {
      this.progressing = true;
      this.timerCount();
      const startTime = Date.now();
      const [err, md5] = await ipcRenderer.invoke("GetFileMD5", { file: this.sourceFilePath });
      this.Done = true;
      if (err) {
        window.$message.error(err);
        return false;
      }
      this.fileMD5 = md5;
      this.Done = true;
      this.progressing = false;
      const usedTime = Date.now() - startTime;
      if (usedTime < 1000) {
        this.usedTimeText = `${usedTime}毫秒`;
      } else {
        this.usedTimeText = `${usedTime / 1000}秒`;
      }
    },
    async getFileSize() {
      const [err, { Code, FileSize, Msg }] = await ipcRenderer.invoke("GetFileSize", { file: this.sourceFilePath });
      if (err) {
        window.$message.error(err);
        return false;
      }
      if (Code !== 0) {
        window.$message.error(Msg);
        return false;
      }
      this.fileSize = FileSize;
    },
    copy() {
      navigator.clipboard.writeText(this.fileMD5).then(() => {
        window.$message.success("已成功复制到剪切板");
      });
    },
    timerCount() {
      setTimeout(() => {
        if (!this.Done) {
          this.usedTime++;
          this.usedTimeText = `${this.usedTime}秒`;
          this.timerCount();
        }
      }, 1000);
    },
  },
};
</script>

<style lang="less" scoped>
.wrap {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.content-wrap {
  width: 100%;
  flex-grow: 1;
  margin-top: 10px;
  border-top: 1px solid #eee;
  padding: 10px;
}

.row-wrap {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.margin-left-20 {
  margin-left: 20px;
}

.compute-status {
  margin-bottom: 10px;
  color: #999;
}
</style>
