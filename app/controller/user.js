/*
 * @Descripttion:
 * @version:
 * @Author: chunwen
 * @Date: 2022-03-06 14:20:34
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-03-07 17:06:48
 */
const Controller = require('egg').Controller;

class UserController extends Controller {
  index() {
    this.ctx.body = "hello egg";
  }
  // 创建用户
  async create() {
    const { ctx, service } = this;
    const body = ctx.request.body;
    const userService = service.user;
    // 参数校验
    ctx.validate({
      username: { type: "string" },
      email: { type: "email" },
      password: { type: "string" },
    });
    // 判断用户是否存在
    if (await userService.findByUsername(body.username)) {
      ctx.throw(422, "用户已存在");
    }
    if (await userService.findByEmail(body.email)) {
      ctx.throw(422, "邮箱已存在");
    }
    // 保存用户
    const user = await userService.creteUser(body);
    // 生成token
    const token = await userService.createToken({ userId: user._id });
    // 发送响应
    ctx.body = {
      user: {
        ...ctx.helper._.pick(user, [
          "email",
          "username",
          "channelDescription",
          "avatar",
        ]),
        token,
      },
    };
  }
  // 登录
  async login() {
    const { ctx, service } = this;
    const body = ctx.request.body;
    const userService = service.user;
    // 数据验证
    ctx.validate({
      email: { type: "email" },
      password: { type: "string" },
    });
    // 校验邮箱是否存在
    const user = await userService.findByEmail(body.email);
    if (!user) {
      ctx.throw(422, "用户邮箱不存在");
    }
    // 校验密码是否正确
    if (this.ctx.helper.md5(body.password) !== user.password) {
      ctx.throw(422, "用户密码错误");
    }
    // 生成token
    const token = await userService.createToken({ userId: user._id });
    // 发送数据
    ctx.body = {
      user: {
        ...ctx.helper._.pick(user, [
          "email",
          "username",
          "channelDescription",
          "avatar",
        ]),
        token,
      },
    };
  }
  // 获取当前用户
  async getCurrentUser() {
    const { ctx } = this;
    // 验证token
    // 获取用户
    // 发送响应
    const user = ctx.user;
    ctx.body = {
      user: {
        email: user.email,
        token: this.ctx.header.authorization,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
      },
    };
  }
  // 更新用户数据
  async update() {
    const { ctx } = this;
    const body = ctx.request.body;
    const userService = ctx.service.user;
    // 1校验数据
    ctx.validate({
      email: { type: "email", required: false },
      username: { type: "string", required: false },
      password: { type: "string", required: false },
      channelDescription: { type: "string", required: false },
      avatar: { type: "string", required: false },
    });
    // 2校验用户是否存在
    if (body.email) {
      if (
        body.email !== ctx.user.email &&
        (await userService.findByEmail(body.email))
      ) {
        ctx.throw(422, "email 已存在");
      }
    }
    if (body.username) {
      if (
        body.username !== ctx.user.username &&
        (await userService.findByUsername(body.username))
      ) {
        ctx.throw(422, "username 已存在");
      }
    }
    // 4更新用户信息
    const user = await userService.updateUser(body);
    // 5返回更新之后的用户信息
    ctx.body = {
      user: {
        ...ctx.helper._.pick(user, [
          "email",
          "username",
          "channelDescription",
          "avatar",
        ]),
        token: ctx.header.authorization,
      },
    };
  }
  // 频道订阅
  async subscribe() {
    const { ctx } = this;
    const userId = ctx.user._id;
    const channelId = ctx.params.userId;
    // 1. 用户不能订阅自己
    if (userId.equals(channelId)) {
      ctx.throw(422, "用户不能订阅自己");
    }
    // 2. 添加订阅
    const user = await ctx.service.user.subscribe(userId, channelId);
    // 3. 发送响应
    ctx.body = {
      user: {
        ...ctx.helper._.pick(user, [
          "username",
          "email",
          "avatar",
          "cover",
          "subscribersCount",
          "channelDescription",
        ]),
        isSubscribed: true,
      },
    };
  }
  // 取消订阅
  async unsubscribe() {
    const { ctx } = this;
    const userId = ctx.user._id;
    const channelId = ctx.params.userId;
    // 1. 用户不能订阅自己
    if (userId.equals(channelId)) {
      ctx.throw(422, "用户不能取消订阅自己");
    }
    // 2. 取消订阅
    const user = await ctx.service.user.unsubscribe(userId, channelId);
    // 3. 发送响应
    ctx.body = {
      user: {
        ...ctx.helper._.pick(user, [
          "username",
          "email",
          "avatar",
          "cover",
          "subscribersCount",
          "channelDescription",
        ]),
        isSubscribed: false,
      },
    };
  }
  // 获取用户资料
  async getUser() {
    // 1获取订阅状态
    let isSubscribed = false;
    // 2获取用户信息
    if (this.ctx.user) {
      const record = await this.app.model.Subscription.findOne({
        user: this.ctx.user._id,
        channel: this.ctx.params.userId,
      });
      if (record) {
        isSubscribed = true;
      }
    }
    const user = await this.app.model.User.findById(this.ctx.params.userId);
    // 3发送响应
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          "username",
          "email",
          "avatar",
          "cover",
          "subscribersCount",
          "channelDescription",
        ]),
        isSubscribed,
      },
    };
  }
  // 订阅列表
  async getSubscriptions() {
    const { ctx, app } = this
    const { Subscription, User } = app.model;
    let subscriptions = await Subscription.find({
      user: ctx.params.userId,
    }).populate({
      path: "channel",
      model: User,
      select: "",
    });
    subscriptions = subscriptions.map((item) => {
      return ctx.helper._.pick(item.channel, ["_id", "username", "avatar"])
    })
    ctx.body = {
      subscriptions
    }
  }
}

module.exports = UserController;
