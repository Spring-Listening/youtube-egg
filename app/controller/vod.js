/*
 * @Descripttion: 
 * @version: 
 * @Author: chunwen
 * @Date: 2022-03-07 21:13:40
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-03-10 11:33:51
 */
const Controller = require("egg").Controller;

class VodController extends Controller {
  // 创建视频
  async createUploadVideo() {
    const query = this.ctx.query;

    this.ctx.validate(
      {
        Title: { type: "string" },
        FileName: { type: "string" },
      },
      query
    );

    const video = await this.app.vodClient.request(
      "CreateUploadVideo",
      query,
      {}
    );

    this.ctx.body = video;
  }
  // 刷新上传视频
  async refreshUploadVideo() {
    const { params } = this.ctx;
    this.ctx.validate(
      {
        VideoId: { type: "string" },
      },
      params
    );
    this.ctx.body = await this.app.vodClient.request(
      "RefreshUploadVideo",
      params,
      {}
    );
  }
  // 获取视频信息
  async getVideoInfo() {
    const VideoId = this.ctx.params.videoId;
    const info = {
      PlayURL: [],
      Title: "",
      VideoId: "",
      CoverURL: "",
    };
    await this.app.vodClient
      .request(
        "GetPlayInfo",
        {
          VideoId,
        },
        {}
      )
      .then((response) => {
        if (
          response.PlayInfoList &&
          response.PlayInfoList.PlayInfo &&
          response.PlayInfoList.PlayInfo.length > 0
        ) {
          for (let i = 0; i < response.PlayInfoList.PlayInfo.length; i++) {
            info.PlayURL.push(response.PlayInfoList.PlayInfo[i].PlayURL);
          }
        }
        // base metadata
        if (response.VideoBase) {
          const { Title, VideoId, CoverURL } = response.VideoBase;
          Object.assign(info, { Title, VideoId, CoverURL });
        }
      })
      .catch(function (response) {
        console.log("ErrorCode = " + response.data.Code);
        console.log("ErrorMessage = " + response.data.Message);
        console.log("RequestId = " + response.data.RequestId);
      });
    this.ctx.body = info;
  }
}
module.exports = VodController;