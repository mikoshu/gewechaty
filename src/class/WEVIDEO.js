export class WeVideo {
  constructor(obj) {
    // 对 linkUrl 进行空值判断
    if (!obj.videoUrl) {
      throw new Error('videoUrl 字段不能为空');
    }
    // 对 thumbUrl 进行空值判断
    if (!obj.thumbUrl) {
      throw new Error('thumbUrl 字段不能为空');
    }
    // 对 videoDuration 进行空值判断
    if (!obj.videoDuration) {
      throw new Error('videoDuration 字段不能为空');
    }
    if (obj.videoDuration < 1) {
      throw new Error('videoDuration 字段不能小于1');
    }
    this.videoUrl = obj.videoUrl;
    this.thumbUrl = obj.thumbUrl;
    this.videoDuration = obj.videoDuration;
  }

}