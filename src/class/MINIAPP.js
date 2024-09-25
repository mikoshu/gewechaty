export class MiniApp {
  constructor(obj) {
    if (!obj.miniAppId) {
      throw new Error('miniAppId 字段不能为空');
    }
    if (!obj.displayName) {
      throw new Error('displayName 字段不能为空');
    }
    if (!obj.pagePath) {
      throw new Error('pagePath 字段不能为空');
    }
    if (!obj.coverImgUrl) {
      throw new Error('coverImgUrl 字段不能为空');
    }
    if (!obj.title) {
      throw new Error('title 字段不能为空');
    }
    if (!obj.userName) {
      throw new Error('userName 字段不能为空');
    }
    this.miniAppId = obj.miniAppId;
    this.displayName = obj.displayName;
    this.pagePath = obj.pagePath;
    this.coverImgUrl = obj.coverImgUrl;
    this.title = obj.title;
    this.userName = obj.userName;
  }
}