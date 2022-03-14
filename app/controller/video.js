/*
 * @Descripttion: 
 * @version: 
 * @Author: chunwen
 * @Date: 2022-03-08 22:20:35
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-03-11 12:45:56
 */
const Controller = require("egg").Controller;

class VideoController extends Controller {
  async createVideo() {
    const { ctx, app } = this;
    const body = ctx.request.body;
    const { Video } = app.model;
    ctx.validate(
      {
        title: { type: "string" },
        description: { type: "string" },
        vodVideoId: { type: "string" },
        cover: { type: "string" },
      },
      body
    );

    body.user = ctx.user._id;
    const video = await new Video(body).save();

    ctx.status = 201;
    ctx.body = {
      video,
    };
  }
  // 获取视频展示信息
  async getVideo() {
    const { ctx, app } = this;
    const videoId = ctx.params.videoId;
    const { Video, VideoLike, Subscription } = app.model;
    let video = await Video.findById(videoId).populate(
      "user",
      "_id username avatar subscribersCount"
    );
    if (!video) {
      ctx.throw(404, "Video is not found");
    }
    video = video.toJSON();

    video.isLiked = false; // 是否喜欢
    video.isDisliked = false; // 是否不喜欢
    video.user.isSubscribed = false; // 是否已订阅视频作者

    if (ctx.user) {
      const userId = ctx.user._id;
      if (await VideoLike.findOne({ user: userId, video: videoId, like: 1 })) {
        video.isLiked = true;
      }
      if (await VideoLike.findOne({ user: userId, video: videoId, like: -1 })) {
        video.isDisliked = true;
      }
      if (
        await Subscription.findOne({ user: userId, channel: video.user._id })
      ) {
        video.user.isSubscribed = true;
      }
    }

    ctx.status = 201;
    ctx.body = {
      video,
    };
  }
  // 获取视频列表
  async getVideoList() {
    const { Video } = this.app.model;
    let { pageNum = 1, pageSize = 10 } = this.ctx.query;
    pageNum = Number.parseInt(pageNum);
    pageSize = Number.parseInt(pageSize);
    const getVideos = Video.find()
      .populate("user")
      .sort({
        createAt: -1,
      })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize);
    const getVideoCount = Video.countDocuments();
    const [videos, videosCount] = await Promise.all([getVideos, getVideoCount]);
    this.ctx.body = {
      videos,
      videosCount,
    };
  }
  // 获取用户发布视频列表
  async getUserVideoList() {
    const { Video } = this.app.model;
    const { userId } = this.ctx.params;
    let { pageNum = 1, pageSize = 10 } = this.ctx.query;
    pageNum = Number.parseInt(pageNum);
    pageSize = Number.parseInt(pageSize);
    const getVideos = Video.find({ user: userId })
      .populate("user")
      .sort({
        createAt: -1,
      })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize);
    const getVideoCount = Video.countDocuments();
    const [videos, videosCount] = await Promise.all([getVideos, getVideoCount]);
    this.ctx.body = {
      videos,
      videosCount,
    };
  }
  // 获取订阅用户发布的视频列表
  async getSubscribeUserVideoList() {
    const { Subscription, Video } = this.app.model;
    let { pageNum = 1, pageSize = 10 } = this.ctx.query;
    pageNum = Number.parseInt(pageNum);
    pageSize = Number.parseInt(pageSize);
    // 查询关注的用户
    const channels = await Subscription.find({
      user: this.ctx.user._id,
    }).populate("channel");

    const getVideos = Video.find({
      user: {
        $in: channels.map((item) => item.channel._id),
      },
    })
      .populate("user")
      .sort({
        createAt: -1,
      })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize);

    const getVideoCount = Video.countDocuments({
      user: {
        $in: channels.map((item) => item.channel._id),
      },
    });
    const [videos, videosCount] = await Promise.all([getVideos, getVideoCount]);
    this.ctx.body = {
      videos,
      videosCount,
    };
  }
  // 更新视频
  async updateVideo() {
    const { body } = this.ctx.request;
    const { Video } = this.app.model;
    const { videoId } = this.ctx.params;
    const userId = this.ctx.user._id;
    this.ctx.validate(
      {
        title: { type: "string", required: false },
        description: { type: "string", required: false },
        vodVideoId: { type: "string", required: false },
        cover: { type: "string", required: false },
      },
      body
    );

    const video = await Video.findById(videoId);
    if (!video) {
      this.ctx.throw(404, "Video is not found");
    }

    if (!video.user.equals(userId)) {
      this.ctx.throw(403);
    }
    Object.assign(
      video,
      this.ctx.helper._.pick(body, [
        "title",
        "description",
        "vodVideoId",
        "cover",
      ])
    );
    await video.save();
    this.ctx.body = {
      video,
    };
  }
  // 删除视频
  async deleteVideo() {
    const { Video } = this.app.model;
    const { videoId } = this.ctx.params;
    const video = await Video.findById(videoId);
    if (!video.user.equals(this.ctx.user._id)) {
      this.ctx.throw(403);
    }
    await video.remove();
    this.ctx.status = 204;
  }
  // 评论
  async createComment() {
    const body = this.ctx.request.body;
    const { Video, VideoComment } = this.app.model;
    const { videoId } = this.ctx.params;
    // 数据验证
    this.ctx.validate(
      {
        content: "string",
      },
      body
    );

    // 获取评论所属的视频
    const video = await Video.findById(videoId);

    if (!video) {
      this.ctx.throw(404);
    }

    // 创建评论
    let comment = await new VideoComment({
      content: body.content,
      user: this.ctx.user._id,
      video: videoId,
    }).save();

    // 映射评论所属用户和视频字段数据
    comment = await VideoComment.findById(comment._id).populate([
      "user",
      "video",
    ]);

    // 更新视频的评论数量
    video.commentsCount = await VideoComment.countDocuments({
      video: videoId,
    });
    await video.save();

    this.ctx.body = {
      comment,
    };
  }
  // 获取所有评论
  async getVideoComments() {
    const { videoId } = this.ctx.params;
    const { VideoComment } = this.app.model;
    let { pageNum = 1, pageSize = 10 } = this.ctx.query;
    pageNum = Number.parseInt(pageNum);
    pageSize = Number.parseInt(pageSize);

    const getComments = VideoComment.find({
      video: videoId,
    })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .populate(["user", "video"]);

    const getCommentsCount = VideoComment.countDocuments({
      video: videoId,
    });

    const [comments, commentsCount] = await Promise.all([
      getComments,
      getCommentsCount,
    ]);

    this.ctx.body = {
      comments,
      commentsCount,
    };
  }
  // 删除评论
  async deleteVideoComment() {
    const { Video, VideoComment } = this.app.model;
    const { videoId, commentId } = this.ctx.params;

    // 校验视频是否存在
    const video = await Video.findById(videoId);
    if (!video) {
      this.ctx.throw(404, "Video Not Found");
    }

    const comment = await VideoComment.findById(commentId);

    // 校验评论是否存在
    if (!comment) {
      this.ctx.throw(404, "Comment Not Found");
    }

    // 校验评论作者是否是当前登录用户
    if (!comment.user.equals(this.ctx.user._id)) {
      this.ctx.throw(403);
    }

    // 删除视频评论
    await comment.remove();

    // 更新视频评论数量
    video.commentsCount = await VideoComment.countDocuments({
      video: videoId,
    });
    await video.save();

    this.ctx.status = 204;
  }
  // 喜欢视频
  async createLike() {
    const { videoId } = this.ctx.params;
    const { body } = this.ctx.request;
    const { Video, VideoLike } = this.app.model;

    this.ctx.validate({
      like: { type: "number" },
    });
    body.user = this.ctx.user._id;
    body.video = videoId;

    const video = await Video.findById(videoId);
    if (!video) {
      this.ctx.throw(404, "Video is not found");
    }
    // 逻辑判断
    let idLiked = true;
    const doc = await VideoLike.findOne({
      user: this.ctx.user._id,
      video: videoId,
    });
    if (body.like === 1) {
      // like
      if (doc && doc.like === 1) {
        idLiked = false;
        await doc.remove();
      } else if (doc && doc.like === -1) {
        doc.like = 1;
        idLiked = true;
        await doc.save();
      } else {
        idLiked = true;
        await new VideoLike(body).save();
      }
    } else {
      // dislike
      if (doc && doc.like === 1) {
        doc.like = -1;
        idLiked = false;
        await doc.save();
      } else if (doc && doc.like === -1) {
        idLiked = false;
        await doc.remove();
      } else {
        idLiked = false;
        await new VideoLike(body).save();
      }
    }

    video.likesCount = await VideoLike.countDocuments({
      video: videoId,
      like: 1,
    });
    video.dislikesCount = await VideoLike.countDocuments({
      video: videoId,
      like: -1,
    });

    await video.save();

    this.ctx.body = {
      ...video.toJSON(),
      idLiked,
    };
  }
  async likeList() {
    const { VideoLike, Video } = this.app.model
    let { pageNum = 1, pageSize = 10 } = this.ctx.query
    pageNum = Number.parseInt(pageNum)
    pageSize = Number.parseInt(pageSize)
    const likes = await VideoLike.find({ user: this.ctx.user._id, like: 1})
      .sort({ createAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)

    const getVideos = Video.find({
      _id: {
        $in: likes.map((item) => item.video)
      }
    })
    
    const getCounts = VideoLike.countDocuments({user: this.ctx.user._id, like: 1})
    
    const [videos, counts] = await Promise.all([getVideos, getCounts]);
    this.ctx.body = {
      videos,
      counts
    };
  }
}
module.exports = VideoController;