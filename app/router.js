/*
 * @Descripttion:
 * @version:
 * @Author: chunwen
 * @Date: 2022-03-06 14:20:34
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-03-11 12:25:16
 */

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller } = app;
  const auth = app.middleware.auth();

  router.prefix("/api");
  router.get("/", controller.user.index);
  router.post("/users", controller.user.create);
  router.post("/users/login", controller.user.login);
  router.get("/user", auth, controller.user.getCurrentUser);
  router.patch("/user", auth, controller.user.update);
  // 频道
  router.post("/users/:userId/subscribe", auth, controller.user.subscribe);
  router.delete("/users/:userId/subscribe", auth, controller.user.unsubscribe);
  // 获取用户资料
  router.get(
    "/users/:userId",
    app.middleware.auth({ required: false }),
    controller.user.getUser
  );
  router.get("/users/:userId/subscriptions", controller.user.getSubscriptions);

  // 阿里云vod
  router.get("/vod/CreateUploadVideo", auth, controller.vod.createUploadVideo);
  router.get(
    "/vod/RefreshUploadVideo/:VideoId",
    auth,
    controller.vod.refreshUploadVideo
  );
  router.get(
    "/videoInfo/:videoId",
    app.middleware.auth({ required: false }),
    controller.vod.getVideoInfo
  );

  // 创建视频
  router.post("/videos", auth, controller.video.createVideo);
  // 获取视频详情
  router.get(
    "/video/:videoId",
    app.middleware.auth({ required: false }),
    controller.video.getVideo
  );
  // 获取视频列表
  router.get(
    "/videos",
    app.middleware.auth({ required: false }),
    controller.video.getVideoList
  );
  // 获取用户发布视频列表
  router.get("/users/:userId/videos", controller.video.getUserVideoList);
  // 获取当前用户关注频道的视频列表
  router.get(
    "/user/videos/feed",
    auth,
    controller.video.getSubscribeUserVideoList
  );
  // 更新视频
  router.patch("/videos/:videoId", auth, controller.video.updateVideo);
  // 删除视频
  router.delete("/videos/:videoId", auth, controller.video.deleteVideo);
  //
  router.post("/videos/:videoId/comments", auth, controller.video.createComment) // 添加视频评论
  router.get("/videos/:videoId/comments", controller.video.getVideoComments); // 获取视频评论列表
  router.delete('/videos/:videoId/comments/:commentId', auth, controller.video.deleteVideoComment) // 删除视频评论

  router.post("/videos/:videoId/like", auth, controller.video.createLike); // 1 喜欢 -1 不喜欢
  router.get("/user/videos/like", auth, controller.video.likeList);
};
