/*
 * @Descripttion:
 * @version:
 * @Author: chunwen
 * @Date: 2022-03-06 14:20:34
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-03-14 23:37:33
 */

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + "_1646547622833_8013";

  // add your middleware config here
  config.middleware = ["errorHandler"];

  config.mongoose = {
    client: {
      // mongodb+srv://root:<password>@youtube-clone.xecv3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
      url: "",
      options: {
        useUnifiedTopology: true,
      },
      // mongoose global plugins, expected a function or an array of function and options
      plugins: [],
    },
  };
  // 防止网络攻击功能  关闭
  config.security = {
    csrf: {
      enable: false,
    },
  };
  config.jwt = {
    secret: "1cd3f51c-d342-4168-88fd-ee535d083c2a",
    expiresIn: "30d",
  };
  config.cors = {
    origin: '*'
  }

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
