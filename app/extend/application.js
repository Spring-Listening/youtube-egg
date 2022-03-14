/*
 * @Descripttion: 
 * @version: 
 * @Author: chunwen
 * @Date: 2022-03-07 22:27:56
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-03-08 15:09:06
 */
const RPCClient = require("@alicloud/pop-core").RPCClient;

function initVodClient(accessKeyId, accessKeySecret) {
  const regionId = "cn-shenzhen"; // 点播服务接入地域
  const client = new RPCClient({
    //填入AccessKey信息
    accessKeyId: accessKeyId,
    accessKeySecret: accessKeySecret,
    endpoint: "http://vod." + regionId + ".aliyuncs.com",
    apiVersion: "2017-03-21",
  });
  return client;
}

let vodClient = null

module.exports = {
  get vodClient() {
    if (!vodClient) {
      const { accessKeyId, accessKeySecret } = this.config.vod;
      vodClient = initVodClient(accessKeyId, accessKeySecret);
    }
    return vodClient;
  }
};