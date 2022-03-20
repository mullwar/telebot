module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended"
  ],
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: "module"
  },
  env: {
    es6: true,
    node: true,
    jest: true
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "no-console": "warn",
    "comma-dangle": ["error", "never"],
    "quotes": ["error", "double"],
    "indent": ["error", 2, { "SwitchCase": 1 }],
    "semi": ["error", "always"],
    "@typescript-eslint/semi": ["error"],
    "no-trailing-spaces": "error",
    "eol-last": ["error", "always"],
    "curly": ["error", "multi-line"],
    "keyword-spacing": ["error", { "before": true }],
    "space-before-blocks": "error",
    "object-property-newline": ["error", { "allowAllPropertiesOnSameLine": true }],
    "object-curly-spacing": ["error", "always"],
    "space-before-function-paren": ["error", {
      "anonymous": "never",
      "named": "never",
      "asyncArrow": "always"
    }],
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/explicit-function-return-type": "off"
  }
};
