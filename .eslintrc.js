module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2017
    },
    "rules": {
        "no-console": "off",
        "indent": ["error", 4],
        "semi": ["error", "always"],
        "no-trailing-spaces": "error",
        "eol-last": ["error", "always"],
        "curly": ["error", "multi-line"],
        "keyword-spacing": ["error", { "before": true }],
        "space-before-blocks": "error"
    }
};
