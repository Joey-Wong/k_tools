<template>
  <div class="wrap">
    <h2 class="title">批量移动文件</h2>
    <div class="content-wrap">
      <BtnLine
        title="操作目录:"
        :disabled="progressing"
        @onClick="choseDir('sourceDir')"
        type="primary"
        :text="sourceDir || '选择操作文件夹'"
      />
      <BtnLine
        title="目标目录:"
        :disabled="progressing"
        @onClick="choseDir('targetDir')"
        type="primary"
        :text="targetDir || '选择目标文件夹'"
      />
      <LineWrap title="深度扫描:">
        <n-space>
          <n-radio :checked="isDeep" @change="setIsDeep(true)">是</n-radio>
          <n-radio :checked="!isDeep" @change="setIsDeep(false)">否</n-radio>
        </n-space>
        <p class="tip">深度扫描会扫描目录中的子目录文件</p>
      </LineWrap>
      <LineWrap title="匹配规则:">
        <n-space>
          <n-input v-model:value="fileNameReg" type="text" placeholder="文件名匹配字符或正则表达式" />
        </n-space>
        <p class="tip" style="margin-left: 10px">匹配上的文件将被移动</p>
      </LineWrap>
      <LineWrap title="使用正则:">
        <n-space>
          <n-switch v-model:value="isUseReg" />
        </n-space>
        <p class="tip" style="margin-left: 10px">
          如正则表达式
          <span>^[0-9]*$</span>
          会匹配上文件名全为数字的文件
        </p>
      </LineWrap>
      <LineWrap title="测试:">
        <n-space>
          <n-input v-model:value="testFileName" type="text" placeholder="请输入测试文件名" />
          <n-button @click="test()" type="primary">测试</n-button>
        </n-space>
      </LineWrap>
      <div v-show="sourceDir && targetDir && fileNameReg" style="margin-bottom: 8px">
        <n-space>
          <n-button :disabled="progressing" @click="move()" type="primary">开始移动</n-button>
        </n-space>
      </div>
    </div>
    <Log :show="progressing || Done" ref="refIDBatchMoveFiles" />
  </div>
</template>

<script>
import { NButton, useMessage, NSpace, NRadio, NInput, NSwitch } from "naive-ui";
import Log from "@/components/Log";
import BtnLine from "@/components/BtnLine";
import LineWrap from "@/components/LineWrap";
import common from "@/mixins/common";
let BatchMoveFilesSelf = null;
export default {
  name: "MoveFiles",
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
      testFileName: "",
      isUseReg: false,
      fileNameReg: "",
      refID: "",
    };
  },
  mounted() {
    BatchMoveFilesSelf = this;
    ipcRenderer.on("BatchMoveFiles", this.logCB);
  },
  beforeUnmount() {
    ipcRenderer.removeAllListeners("BatchMoveFiles");
  },
  methods: {
    logCB(event, res) {
      const { Code, Msg, Done, Log } = JSON.parse(res);
      BatchMoveFilesSelf.$refs.refIDBatchMoveFiles.addLog({
        type: Code !== 0 ? "error" : "",
        log: Code !== 0 ? Msg : Log,
      });
      if (Done) {
        BatchMoveFilesSelf.Done = true;
        BatchMoveFilesSelf.progressing = false;
      }
    },
    setIsDeep(v) {
      this.isDeep = v;
    },
    test() {
      if (!this.fileNameReg) {
        window.$message.warning(`请输入文件名匹配规则`);
        return false;
      }
      if (!this.testFileName) {
        window.$message.warning(`请输入测试文件名`);
        return false;
      }
      try {
        let isHit = false;
        if (this.isUseReg) {
          let regText = this.fileNameReg;
          if (regText[0] === "/") {
            regText = regText.substring(1);
          }
          if (regText[regText.length - 1] === "/") {
            regText = regText.substring(0, regText.length - 1);
          }
          const reg = new RegExp(regText);
          isHit = reg.test(this.testFileName);
        } else {
          isHit = this.testFileName.indexOf(this.fileNameReg) > -1;
        }

        window.$message.info(`文件 ${this.testFileName} ${isHit ? "会" : "不会"}被移动`);
      } catch (e) {
        window.$message.error(`请输入标准的正则表达式,如 /^[0-9]{1,2}$/`);
      }
    },
    move() {
      this.$refs.refIDBatchMoveFiles.clearLog();
      if (!this.sourceDir) {
        window.$message.warning(`请选择操作文件夹`);
        return false;
      }
      if (!this.targetDir) {
        window.$message.warning(`请选择目标文件夹`);
        return false;
      }
      if (!this.fileNameReg) {
        window.$message.warning(`请输入文件名匹配规则`);
        return false;
      }

      this.progressing = true;
      const params = {
        sourceDir: this.sourceDir,
        targetDir: this.targetDir,
        fileNameReg: this.fileNameReg,
        isUseReg: this.isUseReg,
        isDeep: this.isDeep,
      };
      ipcRenderer.invoke("BatchMoveFiles", params);
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
