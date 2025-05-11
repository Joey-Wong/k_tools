//.eslintrc.js
module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "plugin:vue/essential",
    "plugin:prettier/recommended", // add prettier-eslint plugin which will uses the `.prettierrc.js` config
  ],
  rules: {
    //'prettier/prettier': 'error',
    // "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-console": "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "vue/multi-word-component-names": "off",
    "vue/no-v-model-argument": "off",
  },
  overrides: [
    {
      files: ["**/__tests__/*.{j,t}s?(x)"],
      env: {
        mocha: true,
      },
    },
  ],
};
