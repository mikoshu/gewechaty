export class AppMsg {
  constructor(obj) {
    // 对 appmsg 进行空值判断
    if (!obj.appmsg) {
      throw new Error('appmsg 字段不能为空');
    }
    if(typeof obj.appmsg !== 'string'){
      throw new Error('appmsg 字段必须为字符串');
    }
    this.appmsg = obj.appmsg;
  }

}