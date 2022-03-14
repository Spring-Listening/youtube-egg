/*
 * @Descripttion: 
 * @version: 
 * @Author: chunwen
 * @Date: 2022-03-06 21:45:25
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-03-07 15:48:44
 */
module.exports = (options = { required: true }) => {
  // 返回一个中间件处理函数
  return async (ctx, next) => {
    // 获取请求头 token
    let token = ctx.headers["authorization"]; // Bearer + ' ' + token
    token = token ? token.split("Bearer ")[1] : null;

    if (token) {
      // next
      try {
        const data = await ctx.service.user.verifyToken(token);
        const user = await ctx.model.User.findById(data.userId);
        ctx.user = user;
      } catch (error) {
        ctx.throw(401);
      }
    } else if (options.required) {
      ctx.throw(401);
    }

    await next();
  };
};