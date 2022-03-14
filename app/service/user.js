/*
 * @Descripttion: 
 * @version: 
 * @Author: chunwen
 * @Date: 2022-03-06 16:41:46
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-03-07 15:36:45
 */
const Service = require('egg').Service
const jwt = require('jsonwebtoken')
class UserService extends Service {
  get User() {
    return this.app.model.User;
  }

  findByUsername(username) {
    return this.User.findOne({
      username,
    });
  }

  findByEmail(email) {
    return this.User.findOne({
      email,
    }).select("+password");
  }

  async creteUser(data) {
    data.password = this.ctx.helper.md5(data.password);
    const user = new this.User(data);
    await user.save();
    return user;
  }

  async createToken(data) {
    return jwt.sign(data, this.app.config.jwt.secret, {
      expiresIn: this.app.config.jwt.expiresIn,
    });
  }

  async verifyToken(token) {
    return jwt.verify(token, this.app.config.jwt.secret);
  }

  async updateUser(data) {
    return this.User.findByIdAndUpdate(this.ctx.user._id, data, { new: true });
  }

  async subscribe(userId, channelId) {
    const { Subscription, User } = this.app.model;
    // 1. 是否已订阅
    const record = await Subscription.findOne({
      user: userId,
      channel: channelId,
    });
    const user = await User.findById(channelId);
    // 2. 否，添加订阅
    if (!record) {
      await new Subscription({
        user: userId,
        channel: channelId,
      }).save();
      user.subscribersCount++;
      await user.save();
    }
    // 3. 返回用户信息
    return user;
  }

  async unsubscribe(userId, channelId) {
    const { Subscription, User } = this.app.model;
    // 1. 是否已订阅
    const record = await Subscription.findOne({
      user: userId,
      channel: channelId,
    });
    const user = await User.findById(channelId);
    // 2. 否，添加订阅
    if (record) {
      await record.remove();
      user.subscribersCount--;
      await user.save();
    }
    // 3. 返回用户信息
    return user;
  }
}

module.exports = UserService;