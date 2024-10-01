import {acceptContact, searchContact, addContact, rejectContact} from '@/action/contact.js'
export class Friendship {
  constructor(obj) {
    this.fromName = obj.fromnickname || obj.nickName; // 代表联系人的信息
    this.formId = obj.fromusername
    this.v3 = obj.encryptusername || obj.v3
    this.v4 = obj.ticket || obj.v4
    this.bigHeadImgUrl = obj.BigHeadImgUrl || obj.bigHeadImgUrl
    this.smallHeadImgUrl = obj.SmallHeadImgUrl || obj.smallHeadImgUrl
    this.content = obj.content
    this.scene = obj.scene 
    /**
     * 3 ：微信号搜索
        4 ：QQ好友
        8 ：来自群聊
        15：手机号
     */
  }

  // 实例方法1：accept()
  accept() {
    return acceptContact(this.scene, this.v3, this.v4)
  }
  reject(content) {
    return rejectContact(this.scene, this.v3, this.v4, content)
  }

  // 实例方法2：hello()
  hello() {
    return this.content;
  }

  // 实例方法3：contact()
  contact() {
    return new Contact({
      nickName: this.fromName,
      wxid: this.formId,
      bigHeadImgUrl: this.bigHeadImgUrl,
      smallHeadImgUrl: this.smallHeadImgUrl,
    })
  }

  // 实例方法4：type()
  type() {
    return this.scene;
  }

  static async search(mobile) {
    const res = await searchContact(mobile)
    if(res){
      return new Friendship(res)
    }
  }
  // 静态方法1：add()
  static async add(contact, helloMessage) {
    return addContact(contact.v3, contact.v4, helloMessage)
  }
}
