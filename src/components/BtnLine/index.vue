<template>
  <div :class="['row-wrap', noMarginBottom ? 'margin-bottom-2px' : 'margin-bottom-16px']">
    <span>{{ title }}</span>
    <n-button :disabled="disabled" @click="onClick()" :type="type">
      {{ text }}
    </n-button>
  </div>
</template>

<script>
import { NButton } from "naive-ui";
export default {
  name: "BtnLine",
  components: {
    NButton,
  },
  props: {
    title: {
      default: "",
      type: String,
    },
    text: {
      default: "",
      type: String,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
    type: {
      default: "",
      type: String,
    },
    noMarginBottom: {
      default: false,
      type: Boolean,
    },
  },
  methods: {
    onClick() {
      this.$emit("onClick");
    },
  },
};
</script>

<style lang="less" scoped>
.margin-bottom-16px {
  margin-bottom: 16px;
}
.margin-bottom-2px {
  margin-bottom: 2px;
}
.row-wrap {
  display: flex;
  align-items: center;
  span {
    display: inline-block;
    width: 80px;
    text-align: left;
  }
}
</style>
