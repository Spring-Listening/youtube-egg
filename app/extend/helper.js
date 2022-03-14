/*
 * @Descripttion: 
 * @version: 
 * @Author: chunwen
 * @Date: 2022-03-06 16:52:50
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-03-07 15:18:12
 */
const crypto = require('crypto')
const _ = require('lodash')

exports.md5 = str => {
  return crypto.createHash('md5').update(str).digest('hex')
}
exports._ = _