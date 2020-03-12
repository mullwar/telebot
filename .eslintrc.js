module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
    ],
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: 'module',
    },
    env: {
        es6: true,
        node: true,
        jest: true
    },
    plugins: ['@typescript-eslint'],
    rules: {
        "quotes": ["error", "double"],
        "@typescript-eslint/explicit-function-return-type": "off",
    }
};
