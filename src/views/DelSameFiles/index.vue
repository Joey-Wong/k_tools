<template>
  <div class="wrap">
    <h2 class="title">文件查重与删除</h2>
    <div class="content-wrap">
      <BtnLine
        title="扫描目录:"
        :disabled="progressing"
        @onClick="choseDir()"
        type="primary"
        :text="sourceDir || '选择扫描文件夹'"
      />
      <LineWrap title="深度扫描:">
        <n-space>
          <n-radio :checked="isDeep" @change="setIsDeep(true)">是</n-radio>
          <n-radio :checked="!isDeep" @change="setIsDeep(false)">否</n-radio>
        </n-space>
        <p class="tip">深度扫描会扫描目录中的子目录</p>
      </LineWrap>
      <n-button
        v-show="sourceDir"
        :loading="progressing"
        :disabled="progressing"
        @click="getDirSameFileMD5()"
        type="primary"
      >
        {{ progressing ? "扫描中..." : "开始扫描" }}
      </n-button>
    </div>
    <Log :show="progressing || Done" ref="refIDBatchDelSameFile" />
  </div>
</template>

<script>
import { NButton, useMessage, NSpace, NRadio } from "naive-ui";
import BtnLine from "@/components/BtnLine";
import LineWrap from "@/components/LineWrap";
import common from "@/mixins/common";
import Log from "@/components/Log";
let BatchDelSameFilesSelf = null;
export default {
  name: "DelSameFiles",
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
    BatchDelSameFilesSelf = this;
    ipcRenderer.on("BatchDelSameFile", this.logCB);
  },
  beforeUnmount() {
    ipcRenderer.removeAllListeners("BatchDelSameFile");
  },
  methods: {
    logCB(event, res) {
      const { Code, Msg, Done, Log } = JSON.parse(res);
      BatchDelSameFilesSelf.$refs.refIDBatchDelSameFile.addLog({
        type: Code !== 0 ? "error" : "",
        log: Code !== 0 ? Msg : Log,
      });
      if (Done) {
        BatchDelSameFilesSelf.Done = true;
        BatchDelSameFilesSelf.progressing = false;
      }
    },
    setIsDeep(v) {
      this.isDeep = v;
    },
    getDirSameFileMD5() {
      this.$refs.refIDBatchDelSameFile.clearLog();
      this.progressing = true;
      const params = {
        sourceDir: this.sourceDir,
        isDeep: this.isDeep,
      };
      ipcRenderer.invoke("BatchDelSameFile", params);
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

.tip {
  color: #999;
  padding-left: 6em;
  span {
    background-color: #eee;
    border-radius: 4px;
    padding: 4px;
    color: chocolate;
  }
}

.compute-status {
  margin-bottom: 10px;
  color: #999;
}
</style>
