export class Voice {
  constructor(obj) {
    // 对 linkUrl 进行空值判断
    if (!obj.voiceUrl) {
      throw new Error('voiceUrl 字段不能为空');
    }
    // 对 videoDuration 进行空值判断
    if (!obj.voiceDuration) {
      throw new Error('voiceDuration 字段不能为空');
    }
    if (obj.voiceDuration < 1) {
      throw new Error('voiceDuration 字段不能小于1');
    }
    this.voiceUrl = obj.voiceUrl;
    this.voiceDuration = obj.voiceDuration;
  }

}