export class UrlLink {
  constructor(obj) {
    // 对 linkUrl 进行空值判断
    if (!obj.linkUrl) {
      throw new Error('linkUrl 字段不能为空');
    }
    // 对 thumbUrl 进行空值判断
    if (!obj.thumbUrl) {
      throw new Error('thumbUrl 字段不能为空');
    }
    this.title = obj.title;
    this.desc = obj.desc;
    this.linkUrl = obj.linkUrl;
    this.thumbUrl = obj.thumbUrl;
  }

}