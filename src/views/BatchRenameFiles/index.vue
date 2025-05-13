<template>
  <div class="wrap">
    <h2 class="title">批量重命名文件</h2>
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
        <p style="color: #999">深度扫描会重命名子文件夹的文件</p>
      </LineWrap>
      <LineWrap title="使用正则:">
        <n-space>
          <n-switch v-model:value="isUseReg" />
        </n-space>
      </LineWrap>
      <LineWrap v-show="isUseReg" title="" noMarginBottom>
        <n-space>
          <n-input v-model:value="regFind" type="text" placeholder="请输入查找正则" />
          <n-input v-model:value="regReplace" type="text" placeholder="请输入替换内容" />
        </n-space>
      </LineWrap>
      <LineWrap v-show="isUseReg" title="">
        <n-space>
          <p class="tip">
            如查找正则
            <span>^(.*)AB(.*)$</span>
            替换内容
            <span>$1-$2</span>
            会将文件名
            <span>123AB456</span>
            改为
            <span>123-456</span>
          </p>
        </n-space>
      </LineWrap>
      <LineWrap v-show="!isUseReg" title="命名规则:" noMarginBottom>
        <n-space>
          <n-select v-model:value="selectedRule" :options="rules" />
          <n-input
            v-show="Number(selectedRule) < 3"
            v-model:value="addContent"
            type="text"
            :placeholder="rules[selectedRule].inputDes"
          />
        </n-space>
      </LineWrap>
      <LineWrap v-show="!isUseReg" title="">
        <n-space>
          <p style="color: #999">{{ rules[selectedRule].des }}</p>
        </n-space>
      </LineWrap>
      <LineWrap title="测试规则:">
        <n-space>
          <n-input v-model:value="testFileName" type="text" placeholder="请输入测试文件名" />
          <n-button class="margin-left-20" @click="test()" type="primary">测试</n-button>
        </n-space>
      </LineWrap>
      <LineWrap title="" v-show="testFileNameRes">
        <p class="tip">
          文件名
          <span>{{ testFileName }}</span>
          将被重命名为
          <span>{{ testFileNameRes }}</span>
        </p>
      </LineWrap>
      <div style="margin-top: 20px">
        <n-button :disabled="progressing" @click="start()" type="primary">开始批量重命名</n-button>
      </div>
    </div>
    <Log :show="progressing || Done" ref="refIDBatchRenameFiles" />
  </div>
</template>

<script>
import { NButton, useMessage, NSpace, NRadio, NInput, NSwitch, NSelect } from "naive-ui";
import Log from "@/components/Log";
import BtnLine from "@/components/BtnLine";
import LineWrap from "@/components/LineWrap";
import common from "@/mixins/common";

let BatchRenameFilesSelf = null;
export default {
  name: "BatchRenameFiles",
  mixins: [common],
  components: {
    NButton,
    NSpace,
    NRadio,
    NInput,
    NSwitch,
    NSelect,
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
      rules: [
        {
          label: "批量添加前缀",
          value: "0",
          des: "如ab.txt添加前缀c将重命名为cab.txt",
          inputDes: "请输入添加的前缀",
        },
        {
          label: "批量添加后缀(在扩展名前添加)",
          value: "1",
          des: "如ab.txt添加后缀c将重命名为abc.txt",
          inputDes: "请输入添加的后缀",
        },
        {
          label: "批量添加后缀(在扩展名后添加)",
          value: "2",
          des: "如ab.txt添加后缀c将重命名为ab.txtc",
          inputDes: "请输入添加的后缀",
        },
        {
          label: "文件名改为数字1开头并依次累加(保留扩展名)",
          value: "3",
          des: "如ab.txt将重命名为1.txt",
        },
      ],
      selectedRule: "0",
      addContent: "", // 添加的文件名内容(前缀后缀等)
      testFileName: "",
      testFileNameRes: "",
      isUseReg: false,
      regFind: null,
      regReplace: null,
    };
  },
  mounted() {
    BatchRenameFilesSelf = this;
    ipcRenderer.on("BatchRenameFiles", this.logCB);
  },
  beforeUnmount() {
    ipcRenderer.removeAllListeners("BatchRenameFiles");
  },
  methods: {
    logCB(event, res) {
      const { Code, Msg, Done, Log } = JSON.parse(res);
      BatchRenameFilesSelf.$refs.refIDBatchRenameFiles.addLog({
        type: Code !== 0 ? "error" : "",
        log: Code !== 0 ? Msg : Log,
      });
      if (Done) {
        BatchRenameFilesSelf.Done = true;
        BatchRenameFilesSelf.progressing = false;
      }
    },
    setIsDeep(v) {
      this.isDeep = v;
    },
    test() {
      if (!this.testFileName) {
        window.$message.success("请输入测试文件名");
        return false;
      }
      if (this.isUseReg) {
        if (!this.regFind) {
          window.$message.success("请输入查找正则");
          return false;
        }
        if (!this.regReplace) {
          window.$message.success("请输入替换内容");
          return false;
        }
        const reg = new RegExp(this.regFind);
        this.testFileNameRes = this.testFileName.replace(reg, this.regReplace);
        return true;
      }
      if (this.rules[Number(this.selectedRule)].inputDes && !this.addContent) {
        window.$message.success(this.rules[Number(this.selectedRule)].inputDes);
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
    start() {
      this.$refs.refIDBatchRenameFiles.clearLog();
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
        if (!this.regReplace) {
          window.$message.success("请输入替换内容");
          return false;
        }
      }
      if (this.rules[Number(this.selectedRule)].inputDes && !this.addContent) {
        window.$message.success(this.rules[Number(this.selectedRule)].inputDes);
        return false;
      }
      const params = {
        sourceDir: this.sourceDir,
        isDeep: this.isDeep,
        selectedRule: this.selectedRule,
        addContent: this.addContent, // 添加的文件名内容(前缀后缀等)
        isUseReg: this.isUseReg,
        regFind: this.regFind,
        regReplace: this.regReplace,
      };
      ipcRenderer.invoke("BatchRenameFiles", params);
    },
  },
  watch: {
    testFileName() {
      this.testFileNameRes = "";
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
