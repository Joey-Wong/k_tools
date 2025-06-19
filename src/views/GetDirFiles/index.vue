<template>
  <div class="wrap">
    <h2 class="title">获取文件列表</h2>
    <div class="content-wrap">
      <BtnLine
        title="文件夹:"
        :disabled="progressing"
        @onClick="choseDir()"
        type="primary"
        :text="sourceDir || '选择操作文件夹'"
      />
      <BtnLine
        title="保存结果:"
        :disabled="progressing"
        @onClick="choseDir('targetDir')"
        type="primary"
        :text="saveDir || '选择保存路径'"
      />
      <LineWrap title="深度扫描:">
        <n-space>
          <n-radio :checked="isDeep" @change="setIsDeep(true)">是</n-radio>
          <n-radio :checked="!isDeep" @change="setIsDeep(false)">否</n-radio>
        </n-space>
        <p style="color: #999">深度扫描会扫描文件夹中的子文件夹</p>
      </LineWrap>
      <div style="margin-top: 20px">
        <n-button :disabled="progressing" @click="start()" type="primary">开始获取</n-button>
      </div>
    </div>
    <Log :show="progressing || Done" ref="refIDGetDirFiles" />
  </div>
</template>

<script>
import { NButton, useMessage, NSpace, NRadio } from "naive-ui";
import Log from "@/components/Log";
import BtnLine from "@/components/BtnLine";
import LineWrap from "@/components/LineWrap";
import common from "@/mixins/common";

let GetDirFilesSelf = null;
export default {
  name: "GetDirFiles",
  mixins: [common],
  components: {
    NButton,
    NSpace,
    NRadio,
    BtnLine,
    LineWrap,
    Log,
  },
  setup() {
    window.$message = useMessage();
  },
  data() {
    return {
      isDeep: false,
    };
  },
  mounted() {
    GetDirFilesSelf = this;
    ipcRenderer.on("GetDirFiles", this.logCB);
  },
  beforeUnmount() {
    ipcRenderer.removeAllListeners("GetDirFiles");
  },
  methods: {
    logCB(event, res) {
      const { Code, Msg, Done, Log } = JSON.parse(res);
      GetDirFilesSelf.$refs.refIDGetDirFiles.addLog({
        type: Code !== 0 ? "error" : "",
        log: Code !== 0 ? Msg : Log,
      });
      if (Done) {
        GetDirFilesSelf.Done = true;
        GetDirFilesSelf.progressing = false;
      }
    },
    setIsDeep(v) {
      this.isDeep = v;
    },
    test() {
      if (!this.testFileName) {
        window.$message.warning("请输入测试文件名");
        return false;
      }
      if (this.isUseReg) {
        if (!this.regFind) {
          window.$message.warning("请输入查找正则");
          return false;
        }
        if (!this.regReplace) {
          window.$message.warning("请输入替换内容");
          return false;
        }
        const reg = new RegExp(this.regFind);
        this.testFileNameRes = this.testFileName.replace(reg, this.regReplace);
        return true;
      }
      if (this.rules[Number(this.selectedRule)].inputDes && !this.addContent) {
        window.$message.warning(this.rules[Number(this.selectedRule)].inputDes);
        return false;
      }
      if (this.selectedRule === "0") {
        this.testFileNameRes = `${this.addContent}${this.testFileName}`;
        return true;
      }
      if (this.selectedRule === "1") {
        const pointIndex = this.testFileName.lastIndexOf(".");
        if (pointIndex < 0) {
          this.testFileNameRes = `${this.testFileName}${this.addContent}`;
          return true;
        }
        const fileName = this.testFileName.substring(0, pointIndex);
        const ext = this.testFileName.substring(pointIndex + 1);
        this.testFileNameRes = `${fileName}${this.addContent}.${ext}`;
        return true;
      }
      if (this.selectedRule === "2") {
        this.testFileNameRes = `${this.testFileName}${this.addContent}`;
        return true;
      }
      if (this.selectedRule === "3") {
        this.testFileNameRes = `1${this.testFileName}`;
        return true;
      }
    },
    async start() {
      this.$refs.refIDGetDirFiles.clearLog();
      this.Done = false; // 是否执行完成
      this.progressing = false; // 在执行中
      if (!this.sourceDir) {
        window.$message.warning("请选择操作文件夹");
        return false;
      }
      const [err, files] = await ipcRenderer.invoke("GetFiles", { dir: this.sourceDir, isDeep: this.isDeep });
      if (err) {
        window.$message.error(err);
        return false;
      }
      console.log(files);
      files.forEach((v) => {
        GetDirFilesSelf.$refs.refIDGetDirFiles.addLog({
          type: "",
          log: v,
        });
      });
      try {
        ipcRenderer.invoke("WriteFile", { path: `${this.targetDir}/文件列表.txt`, data: files.join(`\r\n`) });
      } catch (e) {
        window.$message.error(e);
      }
      window.$message.success(`扫描完成,结果已保存至[${this.targetDir}/文件列表.txt]`);
      this.Done = true; // 是否执行完成
      this.progressing = false; // 在执行中
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
  margin-top: 10px;
  border-top: 1px solid #eee;
  padding: 10px;
}

.margin-left-20 {
  margin-left: 20px;
}

.align-item-center {
  display: flex;
  align-items: center;
}
.compute-status {
  margin-bottom: 10px;
  color: #999;
}
</style>
