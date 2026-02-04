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
      <LineWrap title="深度扫描:">
        <n-space>
          <n-radio :checked="isDeep" @change="setIsDeep(true)">是</n-radio>
          <n-radio :checked="!isDeep" @change="setIsDeep(false)">否</n-radio>
        </n-space>
        <p style="color: #999">深度扫描会扫描文件夹中的子文件夹</p>
      </LineWrap>
      <LineWrap title="保留父目录:">
        <n-space>
          <n-radio :checked="isKeepFDir" @change="setIsKeepFDir(true)">是</n-radio>
          <n-radio :checked="!isKeepFDir" @change="setIsKeepFDir(false)">否</n-radio>
        </n-space>
        <p style="color: #999">保留父目录会在保存路径中保留操作文件夹的目录结构</p>
      </LineWrap>
      <BtnLine
        title="保存到:"
        :disabled="progressing"
        @onClick="choseDir('targetDir')"
        type="primary"
        :text="targetDir || '选择保存位置'"
      />
      <div style="margin-top: 20px">
        <n-button :loading="progressing" :disabled="progressing" @click="start()" type="primary">
          {{ progressing ? "正在扫描中..." : "开始执行" }}
        </n-button>
      </div>
    </div>
  </div>
</template>

<script>
import { NButton, useMessage, NSpace, NRadio } from "naive-ui";
import BtnLine from "@/components/BtnLine";
import LineWrap from "@/components/LineWrap";
import common from "@/mixins/common";
import dayjs from "dayjs";

export default {
  name: "GetDirFiles",
  mixins: [common],
  components: {
    NButton,
    NSpace,
    NRadio,
    BtnLine,
    LineWrap,
  },
  setup() {
    window.$message = useMessage();
  },
  data() {
    return {
      isDeep: false,
      isKeepFDir: true,
      progressing: false, // 在执行中
    };
  },
  methods: {
    setIsDeep(v) {
      this.isDeep = v;
    },
    setIsKeepFDir(v) {
      this.isKeepFDir = v;
    },
    async start() {
      if (!this.sourceDir) {
        window.$message.warning("请选择操作文件夹");
        return false;
      }
      if (!this.targetDir) {
        window.$message.warning("请选择保存位置");
        return false;
      }
      this.progressing = true; // 在执行中
      const [err, files] = await ipcRenderer.invoke("GetFiles", { dir: this.sourceDir, isDeep: this.isDeep });
      if (err) {
        window.$message.error(err);
        this.progressing = false; // 在执行中
        return false;
      }
      if (!this.isKeepFDir) {
        const pos = this.sourceDir.length + 1;
        files.forEach((v, index) => {
          files[index] = v.slice(pos);
        });
      }
      const filePath = `${this.targetDir}/文件列表_${dayjs().format("YYYYMMDD")}.txt`;
      try {
        ipcRenderer.invoke("WriteFile", { path: filePath, data: files.join(`\r\n`) });
      } catch (e) {
        window.$message.error(e);
        this.progressing = false; // 在执行中
        return false;
      }
      window.$message.success(`文件已保存至[${filePath}]`);
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
