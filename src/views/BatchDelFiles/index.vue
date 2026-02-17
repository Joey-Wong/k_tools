<template>
  <div class="wrap">
    <h2 class="title">批量删除文件</h2>
    <div class="content-wrap">
      <BtnLine
        title="文件夹:"
        :disabled="progressing"
        @onClick="choseDir()"
        type="primary"
        :text="sourceDir || '选择操作文件夹'"
      />
      <LineWrap title="深度扫描:">
        <n-space>
          <n-radio :checked="isDeep" @change="setIsDeep(true)">是</n-radio>
          <n-radio :checked="!isDeep" @change="setIsDeep(false)">否</n-radio>
        </n-space>
        <p style="color: #999">深度扫描会删除子文件夹的文件</p>
      </LineWrap>
      <LineWrap title="使用正则:">
        <n-space>
          <n-switch v-model:value="isUseReg" />
        </n-space>
      </LineWrap>
      <LineWrap v-show="isUseReg" title="" noMarginBottom>
        <n-space>
          <n-input v-model:value="regFind" type="text" placeholder="请输入查找正则" />
        </n-space>
      </LineWrap>
      <LineWrap v-show="isUseReg" title="">
        <n-space>
          <p class="tip">
            如查找正则
            <span>^(.*)AB(.*)$</span>
            会将文件
            <span>123AB456</span>
            <span>删除</span>
          </p>
        </n-space>
      </LineWrap>
      <LineWrap v-show="!isUseReg" title="删除规则:" noMarginBottom>
        <n-space>
          <n-input v-model:value="fileNameContent" type="text" placeholder="部分文件名" />
        </n-space>
      </LineWrap>
      <LineWrap v-show="!isUseReg" title="">
        <n-space>
          <p style="color: #999">如文件名为123AB456.txt,删除规则为AB,则文件将被删除</p>
        </n-space>
      </LineWrap>
      <LineWrap title="测试规则:">
        <n-space>
          <n-input v-model:value="testFileName" type="text" placeholder="请输入测试文件名" />
          <n-button class="margin-left-20" @click="test()" type="primary">测试</n-button>
        </n-space>
      </LineWrap>
      <LineWrap title="" v-show="hasGesTestRes">
        <p class="tip">
          文件
          <span>{{ testFileName }}</span>
          <span>{{ testFileWillDel ? "将" : "不会" }}被删除</span>
        </p>
      </LineWrap>
      <div style="margin-top: 20px">
        <n-button :disabled="progressing" @click="start()" type="primary">开始批量删除</n-button>
      </div>
    </div>
    <Log :show="progressing || Done" ref="refIDBatchDelFiles" />
  </div>
</template>

<script>
import { NButton, useMessage, NSpace, NRadio, NInput, NSwitch } from "naive-ui";
import Log from "@/components/Log";
import BtnLine from "@/components/BtnLine";
import LineWrap from "@/components/LineWrap";
import common from "@/mixins/common";

let BatchDelFilesSelf = null;
export default {
  name: "BatchDelFiles",
  mixins: [common],
  components: {
    NButton,
    NSpace,
    NRadio,
    NInput,
    NSwitch,
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
      fileNameContent: "", // 添加的文件名内容(前缀后缀等)
      testFileName: "",
      isUseReg: false,
      regFind: "",
      testFileWillDel: false,
      hasGesTestRes: false,
    };
  },
  mounted() {
    BatchDelFilesSelf = this;
    ipcRenderer.on("BatchDelFiles", this.logCB);
  },
  beforeUnmount() {
    ipcRenderer.removeAllListeners("BatchDelFiles");
  },
  methods: {
    logCB(event, res) {
      const { Code, Msg, Done, Log } = JSON.parse(res);
      BatchDelFilesSelf.$refs.refIDBatchDelFiles.addLog({
        type: Code !== 0 ? "error" : "",
        log: Code !== 0 ? Msg : Log,
      });
      if (Done) {
        BatchDelFilesSelf.Done = true;
        BatchDelFilesSelf.progressing = false;
      }
    },
    setIsDeep(v) {
      this.isDeep = v;
    },
    test() {
      if (!this.testFileName) {
        window.$message.success("请输入测试文件名");
        this.hasGesTestRes = false;
        return false;
      }
      if (!this.isUseReg) {
        if (!this.fileNameContent) {
          window.$message.success("请输入删除规则");
          this.hasGesTestRes = false;
          return false;
        }
        this.testFileWillDel = this.testFileName.includes(this.fileNameContent);
        this.hasGesTestRes = true;
        return false;
      }
      if (this.isUseReg) {
        if (!this.regFind) {
          window.$message.success("请输入查找正则");
          this.hasGesTestRes = false;
          return false;
        }
        // 测试文件名是否符合正则
        const reg = new RegExp(this.regFind);
        this.testFileWillDel = reg.test(this.testFileName);
        this.hasGesTestRes = true;
      }
    },
    start() {
      this.$refs.refIDBatchDelFiles.clearLog();
      this.Done = false; // 是否执行完成
      this.progressing = false; // 在执行中
      if (!this.sourceDir) {
        window.$message.success("请选择操作文件夹");
        return false;
      }
      if (this.isUseReg) {
        if (!this.regFind) {
          window.$message.success("请输入查找正则");
          return false;
        }
      }
      const params = {
        sourceDir: this.sourceDir,
        isDeep: this.isDeep,
        fileNameContent: this.fileNameContent, // 添加的文件名内容(前缀后缀等)
        isUseReg: this.isUseReg,
        regFind: this.regFind,
      };
      ipcRenderer.invoke("BatchDelFiles", params);
    },
  },
  watch: {
    testFileName() {
      this.hasGesTestRes = "";
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
