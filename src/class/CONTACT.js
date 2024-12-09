import {say} from '@/action/common'
import {setRemark, find, findAll, contactSync} from '@/action/contact'
import {ResponseMsg} from '@/class/MESSAGE.js'
export class Contact {
  constructor(contactData) {
    this._name = contactData.nickName || 'no name';
    this._alias = contactData.remark || contactData.displayName || this._name;
    // 判断是否是微信好友 暂时不支持
    this._isFriend = true;
    this._wxid = contactData.userName || contactData.wxid || null;
    this._type = 1;
    this._gender = contactData.sex;
    this._province = contactData.province || null;
    this._city = contactData.city || null;
    this._avatarUrl = contactData.bigHeadImgUrl || contactData.smallHeadImgUrl || '';
    this._isSelf = false;
    this.inviterUserName = contactData.inviterUserName || ''
  }

  // 实例方法

  async say (textOrContactOrFileOrUrl) { // 回复消息
    const res = await say(textOrContactOrFileOrUrl, this._wxid)
    return new ResponseMsg(res)
  }

  name() {
    return this._name;
  }

  async alias(newAlias) {
    if(newAlias){
      return await setRemark(this._wxid, newAlias)
    }else{
      return this._alias
    }
  }

  friend() {
    return this._isFriend;
  }

  type() {
    return this._type;
  }

  gender() {
    return this._gender;
  }

  province() {
    return this._province;
  }

  city() {
    return this._city;
  }

  async avatar() {
    return new Promise((resolve) => {
      resolve(this._avatarUrl);
    });
  }

  async sync() {
    // this._wxid
    return await contactSync(this._wxid)
  }

  self() {
    return this._isSelf;
  }

  // 静态方法

  static async find(query) {
    return find(query)
  }

  static async findAll(query) {
    return findAll(query)
  }
}