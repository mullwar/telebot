module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/eslint-recommended'
    ],
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: 'module'
    },
    env: {
        es6: true,
        node: true,
        jest: true
    },
    plugins: ['@typescript-eslint'],
    rules: {
        "no-console": "error",
        "comma-dangle": ["error", "never"],
        "quotes": ["error", "double"],
        "indent": ["error", 4, {"SwitchCase": 1}],
        "semi": ["error", "always"],
        "no-trailing-spaces": "error",
        "eol-last": ["error", "always"],
        "curly": ["error", "multi-line"],
        "keyword-spacing": ["error", {"before": true}],
        "space-before-blocks": "error",
        "object-property-newline": "error",
        "object-curly-spacing": ["error", "always"],
        "@typescript-eslint/explicit-function-return-type": "off"
    }
};
