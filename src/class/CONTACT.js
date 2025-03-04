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

  wxid() {
    return this._wxid;
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
  /**
   * 根据名称、别名或微信 ID 精确查询单个联系人
   * @param {string|Object} query - 查询条件，可以是字符串或查询对象：
   *   - 若为字符串，将按微信 ID 精确查询
   *   - 若为对象，需包含以下属性之一：
   *     @property {string} [name] - 联系人名称（精确匹配）
   *     @property {string} [alias] - 联系人备注名（精确匹配）
   *     @property {string} [wxid] - 联系人微信 ID（精确匹配）
   * @returns {Promise<Contact|null>} 返回 Promise，解析为匹配的联系人对象，未找到返回 null
   * @throws {Error} 当参数格式不符合要求或未提供有效查询条件时抛出
   */
  static async find(query) {
    return find(query)
  }

  /**
   * 批量查询联系人，支持模糊匹配或获取全部
   * @param {Object} [query] - 可选查询条件对象：
   *   - 不传参数时返回所有联系人
   *   - 若传对象，需包含以下属性之一：
   *     @property {string} [name] - 联系人名称（模糊匹配）
   *     @property {string} [alias] - 联系人备注名（模糊匹配）
   * @returns {Promise<Contact[]>} 返回 Promise，解析为联系人数组，无匹配条目时返回空数组
   * @throws {Error} 当参数格式不符合要求或查询条件不合法时抛出
   */
  static async findAll(query) {
    return findAll(query)
  }
}