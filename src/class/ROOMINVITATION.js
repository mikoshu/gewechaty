import {joinRoom} from '@/action/room.js'
import {getContact} from '@/action/contact.js'
export class RoomInvitation {
  constructor(obj) {
    // 从 JSON 数据结构中提取所需信息
    this.fromId = obj.fromId
    this.title = obj.msg.appmsg.title
    this.desc = obj.msg.appmsg.des
    this.thumbUrl = obj.msg.appmsg.thumburl
    this.url = obj.msg.appmsg.url
    this.date = new Date().getTime()
  }
  async accept(){
    return joinRoom(this.url)
  }
  // 方法2：inviter() - 获取邀请人
  async inviter() {
    return getContact(this.fromId)
  }
  // 方法3：topic() - 获取房间主题
  async topic() {
    return new Promise((resolve) => {
      resolve(this.title);
    });
  }
  // 方法4：date() - 获取邀请日期
  async date() {
    return new Promise((resolve) => {
      resolve(new Date(this.date));
    });
  }
  // 方法5：age() - 获取邀请的年龄（以秒为单位）
  async age() {
    return new Promise((resolve) => {
      const currentTime = new Date().getTime();
      const ageInSeconds = Math.floor((currentTime - this.date) / 1000);
      resolve(ageInSeconds);
    });
  }
}
