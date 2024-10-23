import { XMLParser} from "fast-xml-parser";
import { say, revork, forward } from '@/action/common.js';
import {getContact, find} from '@/action/contact'
import {getRoomInfo} from '@/action/room'
import {toFileBox} from '@/action/file'
import {Filebox} from '@/class/FILEBOX'
import {MessageType} from '@/type/MessageType'



// 消息类
export class Message {
  constructor(data) {
    // 从 JSON 数据结构中提取所需信息
    this.fromId = data.Data.FromUserName.string
    this.toId = data.Data.ToUserName.string
    this.isRoom = data.Data.FromUserName.string.endsWith('@chatroom')
    this._msgId = data.Data.MsgId || null;
    this._newMsgId = data.Data.NewMsgId || null;
    this._text = data.Data.Content.string || '';
    this._type = data.Data.MsgType;
    this._createTime = data.Data.CreateTime; // 原始的 CreateTime
    this._date = this._createTime * 1000; // 转换时间戳为 Date
    this._self = data.Wxid === data.Data.FromUserName.string; // 判断是否为自己发的消息
    this._pushContent = data.Data.PushContent || '';
    this._msgSeq = data.Data.MsgSeq || null;
    this._status = data.Data.Status || null;
    if(this.isRoom ){ // 执行一次 自动插入房间数据
      getRoomInfo(this.fromId)
    }
  }
  // 静态属性
  static Type = MessageType
  // 实例方法
  isCompanyMsg() { // 是否是企业微信消息
    const companyList = ['weixin', 'newsapp', 'tmessage', 'qqmail','mphelper', 'qqsafe', 'weibo', 'qmessage', 'floatbottle', 'medianote']
    return this.fromId.includes('gh_') || companyList.includes(this.fromId)
  }
  from() { // 发送者
    if(this.isRoom){
      return getContact(this._text.split(':\n')[0])
    }
    return getContact(this.fromId);
  }
  talker(){
    if(this.isRoom){
      return getContact(this._text.split(':\n')[0])
    }
    return getContact(this.fromId);
  }

  to() { // 接收者
    return getContact(this.toId);
  }

  async room() { // 是否是群聊消息 是则返回群信息
    if(this.isRoom){
      return await getRoomInfo(this.fromId)
    }else{
      return Promise.resolve(false)
    }
  }

  text() { // 消息内容
    if(this.fromId.endsWith('@chatroom')){
      return this._text.split(':\n').slice(1).join(':\n')
    }
    return this._text;
  }

  async say (textOrContactOrFileOrUrl) { // 回复消息
    const res = await say(textOrContactOrFileOrUrl, this.fromId)
    return new ResponseMsg(res)
  }

  type() { // 消息类型
    return Message.getType(this._type, this.text())
  }

  self() { // 是否是自己发的消息
    return this._self;
  }

  async mention() { // 获取@的联系人 ..todo
    return new Promise((resolve) => {
      // 根据消息内容模拟提到的联系人
      console.log('暂不支持')
      resolve(null);
    });
  }

  async mentionSelf() { // 是否被@了
    return new Promise((resolve) => {
      if(this.isRoom && this._pushContent && this._pushContent.includes('@了你')){
        resolve(true)
      }
      resolve(false)
    });
  }

  async forward(to) { // ...todo
    return forward(this.text(), to, this.type())
  }

  date() {
    return new Date(this._date);
  }

  age() {
    const now = new Date();
    return Math.floor((now - this._date) / 1000); // 以秒为单位计算消息的年龄
  }

  async toContact() { // 获取名片 。。。todo
    return new Promise((resolve) => {
      console.log('暂不支持')
      resolve(null);
    });
  }

  async toUrlLink() { // 获取链接。。。todo
    return new Promise((resolve) => {
      console.log('暂不支持')
     resolve(null);
    });
  }

  async toFileBox(type = 2) { // 获取链接。。。todo
    if(this._type !== 3){
      console.log('不是图片类型，无法调用toFileBox方法')
      return null
    }
    return new Promise((resolve) => {
      let xml = ''
      if(this.isRoom){
        xml = this._text.split(":\n")[1]
      }else{
        xml = this._text
      }
      toFileBox(xml, type).then((url) => {
        resolve(Filebox.toDownload(url))
      }).catch(e => {
        console.error(e)
        resolve(null)
      })
    });
  }
  async toFilebox(type = 2){
    return this.toFileBox(type)
  }
  getXml2Json(xml) {
    const parser = new XMLParser();
    let jObj = parser.parse(xml);
    return jObj
  }
  // 静态方法
  static async find(query) {
    return await find(query)
  }

  static async findAll(queryArgs) {
    console.log('暂不支持findAll')
    return Promise.resolve([])
  }

  static getType(type, xml) {
    let parser, jObj
    try{
      switch(type){
        case 1:
          return MessageType.Text
        case 3:
          return MessageType.Image
        case 34:
          return MessageType.Voice
        case 37:
          return MessageType.AddFriend
        case 42:
          return MessageType.Contact
        case 43:
          return MessageType.Video
        case 47:
          return MessageType.Emoji
        case 48:
          return MessageType.Location
        case 49:
          parser = new XMLParser();
          jObj = parser.parse(xml);
          // console.log(jObj)
          if(jObj.msg.appmsg.type === 5){
            if(jObj.msg.appmsg.title === '邀请你加入群聊'){
              return MessageType.RoomInvitation
            }else{ // 公众号链接
              return MessageType.Link
            }
          }else if(jObj.msg.appmsg.type === 74){
            return MessageType.FileStart
          }else if(jObj.msg.appmsg.type === 6){
            return MessageType.File
          }else if(jObj.msg.appmsg.type === 33 || jObj.msg.appmsg.type === 36){
            return MessageType.MiniApp
          }else if (jObj.msg.appmsg.type === 57){
            return MessageType.Quote
          }else if (jObj.msg.appmsg.type === 2000){
            return MessageType.Transfer
          }else if (jObj.msg.appmsg.type === 2001){
            return MessageType.RedPacket
          }else if (jObj.msg.appmsg.type === 51){
            return MessageType.VideoAccount
          }
        case 10002:
          parser = new XMLParser();
          jObj = parser.parse(xml);
          if (jObj.appmsg.type === 'revokemsg'){
            return MessageType.Revork
          }else if (jObj.appmsg.type ==='pat'){
            return MessageType.Pat
          }
        default:
          return MessageType.Unknown
      }
    }catch(e){
      return MessageType.Unknown
    }
    

  }
  
}

export class ResponseMsg {
  constructor(obj) {
    Object.assign(this, obj);
  }
  revork() {
    return revork(this)
  }
}
