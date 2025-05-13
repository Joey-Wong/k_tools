<template>
  <div :style="{ height: height }" v-show="show" class="log-conetnt-wrap">
    <div ref="logRef" class="log-conetnt" v-html="logHtml" />
  </div>
</template>

<script>
const colorType = {
  error: "style='color:ff502c;'",
  success: "style='color:18a058;'",
};
export default {
  name: "Log",
  props: {
    show: {
      default: false,
      type: Boolean,
    },
    height: {
      default: "",
      type: String,
    },
  },
  data() {
    return {
      logHtml: ``,
    };
  },
  methods: {
    addLog({ type, log }) {
      this.logHtml += `<p ${colorType[type] || ""}>${log}</p>`;
      setTimeout(() => {
        const logConetntRef = this.$refs.logRef;
        logConetntRef.scrollTop = logConetntRef.scrollHeight;
      }, 500);
    },
    clearLog() {
      this.logHtml = "";
    },
  },
};
</script>

<style lang="less" scoped>
.log-conetnt-wrap {
  flex-grow: 1;
  padding: 10px;
  width: 100%;
  overflow: hidden;
}
.log-conetnt {
  overflow-y: auto;
  word-break: break-all;
  background-color: #47494e;
  color: #c6c8cd;
  width: 100%;
  height: 100%;
  padding: 6px;
  p {
    margin: 0;
  }
}

/* 滚动条 */
.log-conetnt::-webkit-scrollbar {
  width: 4px;
}
.log-conetnt::-webkit-scrollbar-track {
  background: #1f2937;
}
.log-conetnt::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 2px;
  border: 2px solid #94a3b8;
}
.log-conetnt::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>
