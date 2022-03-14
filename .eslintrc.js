/*
 * @Descripttion: 
 * @version: 
 * @Author: chunwen
 * @Date: 2022-03-06 14:56:59
 * @LastEditors: 
 * @LastEditTime: 2022-03-06 16:32:33
 */
module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "no-console": "off"
    }
};