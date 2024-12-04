import { XMLParser } from "fast-xml-parser";
import { say, revoke, forward, quote } from '@/action/common.js';
import { getContact, find } from '@/action/contact'
import { getRoomInfo } from '@/action/room'
import { toFileBox } from '@/action/file'
import { Filebox } from '@/class/FILEBOX'
import { MessageType } from '@/type/MessageType'



// 消息类
export class Message {
  // 静态属性
  static Type = MessageType
  // 实例属性
  constructor(data) {
    // 从 JSON 数据结构中提取所需信息
    this.wxid = data.Wxid;
    this.fromId = data.Data.FromUserName.string;
    this.toId = data.Data.ToUserName.string;
    this.isRoom = data.Data.FromUserName.string.endsWith('@chatroom');
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
    this._msgSource = data.Data.MsgSource || null;

    if (this.isRoom) { // 执行一次 自动插入房间数据
      getRoomInfo(this.fromId);
    }
  }

  // 实例方法
  isCompanyMsg () { // 是否是企业微信消息
    const companyList = ['weixin', 'newsapp', 'tmessage', 'qqmail', 'mphelper', 'qqsafe', 'weibo', 'qmessage', 'floatbottle', 'medianote']
    return this.fromId.includes('gh_') || companyList.includes(this.fromId)
  }
  //发送者
  from () {
    if (this.isRoom) {
      return getContact(this._text.split(':\n')[0])
    }
    return getContact(this.fromId);
  }
  //发送者
  talker () {
    if (this.isRoom) {
      return getContact(this._text.split(':\n')[0])
    }
    return getContact(this.fromId);
  }
  //接收者
  to () {
    return getContact(this.toId);
  }
  // 是否是群聊消息 是则返回群信息
  async room () {
    if (!this.isRoom) return false;
    if (!this._roomInfo) {
      this._roomInfo = await getRoomInfo(this.fromId);
    }
    return this._roomInfo;
  }
  // 消息内容
  text () {
    if (this.isRoom) {
      return this._text.split(':\n').slice(1).join(':\n')
    }
    return this._text;
  }
  // 发送消息
  async say (textOrContactOrFileOrUrl) {
    const res = await say(textOrContactOrFileOrUrl, this.fromId)
    return new ResponseMsg(res)
  }
  // 消息类型
  type () {
    return Message.getType(this._type, this.text())
  }
  // 是否是自己发的消息
  self () {
    return this._self;
  }
  // 获取@的联系人 ..todo
  async mention () {
    // 根据消息内容模拟提到的联系人
    console.log('暂不支持')
    return null;
  }
  // 是否被@了
  async mentionSelf () {
    if (!this.isRoom || !this._msgSource) {
      return false;
    }
    const result = Message.getXmlToJson(this._msgSource);
    const atUserList = result.msgsource.atuserlist;
    return atUserList?.split(',').includes(this.wxid);
  }
  // 消息转发
  async forward (to) {
    if (!to) {
      console.error('转发消息时，接收者不能为空')
      return
    }
    return forward(this.text(), to, this.type())
  }

  date () {
    return new Date(this._date);
  }

  age () {
    const now = Date.now();
    return Math.floor((now - this._date) / 1000); // 以秒为单位计算消息的年龄
  }
  // 获取名片 。。。todo
  async toContact () {
    console.log('暂不支持')
    return null;
  }
  // 获取链接。。。todo
  async toUrlLink () {
    console.log('暂不支持')
    return null;
  }
  // 获取图片。。。todo
  async toFileBox (type = 2) {
    if (this._type !== 3) {
      console.log('不是图片类型，无法调用toFileBox方法');
      return null;
    }
    let xml = ''
    if (this.isRoom) {
      xml = this._text.split(":\n")[1]
    } else {
      xml = this._text
    }
    try {
      const url = await toFileBox(xml, type);
      return Filebox.toDownload(url)
    } catch (e) {
      console.error(e)
      return null
    }
  }
  // 引用消息
  async quote (title) {
    if (!title || title === '') {
      console.error('引用消息时title不能为空')
      return
    }

    let msg = {
      title,
      msgid: this._newMsgId,
      wxid: this.fromId
    }
    if (this.isRoom) {
      msg.wxid = this._text.split(':\n')[0]
    }
    return quote(msg, this.fromId)
  }
  // 获取xml转json
  static getXmlToJson (xml) {
    const parser = new XMLParser({
      ignoreAttributes: false, // 不忽略属性
      attributeNamePrefix: '', // 移除默认的属性前缀
    });
    let jObj = parser.parse(xml);
    return jObj
  }
  // 静态方法
  static async find (query) {
    return await find(query)
  }

  static async findAll (queryArgs) {
    console.log('暂不支持findAll')
    return Promise.resolve([])
  }

  static getType (type, xml) {
    let jObj
    try {
      switch (type) {
        case 1:
          return MessageType.Text;
          break;
        case 3:
          return MessageType.Image;
          break;
        case 34:
          return MessageType.Voice;
          break;
        case 37:
          return MessageType.AddFriend;
          break;
        case 42:
          return MessageType.Contact;
          break;
        case 43:
          return MessageType.Video;
          break;
        case 47:
          return MessageType.Emoji;
          break;
        case 48:
          return MessageType.Location
          break;
        case 49:
          jObj = Message.getXmlToJson(xml);
          // console.log(jObj)
          if (jObj.msg.appmsg.type === 5) {
            if (jObj.msg.appmsg.title === '邀请你加入群聊') {
              return MessageType.RoomInvitation
            } else { // 公众号链接
              return MessageType.Link;
            }
          } else if (jObj.msg.appmsg.type === 6) {
            return MessageType.File;
          } else if (jObj.msg.appmsg.type === 17) {
            return MessageType.RealTimeLocation;
          } else if (jObj.msg.appmsg.type === 19) {
            return MessageType.ChatHistroy;
          } else if (jObj.msg.appmsg.type === 33 || jObj.msg.appmsg.type === 36) {
            return MessageType.MiniApp;
          } else if (jObj.msg.appmsg.type === 51) {
            return MessageType.VideoAccount;
          } else if (jObj.msg.appmsg.type === 57) {
            return MessageType.Quote;
          } else if (jObj.msg.appmsg.type === 74) {
            return MessageType.FileStart;
          } else if (jObj.msg.appmsg.type === 2000) {
            return MessageType.Transfer;
          } else if (jObj.msg.appmsg.type === 2001) {
            return MessageType.RedPacket;
          }
          break;
        case 50:
          //VOIP挂断
          break;
        case 51:
          //状态通知
          jObj = Message.getXmlToJson(xml);
          if (jObj.msg.name === 'MomentsTimelineStatus') {
            //新的朋友圈消息
          } else if (jObj.msg.name === 'lastMessage') {
            //群聊消息
          }
          break;
        case 56:
          //语音群聊
          break;
        case 10000:
          //群通知
          break;
        case 10002:
          jObj = Message.getXmlToJson(xml);
          if (jObj.sysmsg.type === 'revokemsg') {
            return MessageType.Revoke
          } else if (jObj.sysmsg.type === 'pat') {
            return MessageType.Pat
          } else if (jObj.sysmsg.type === 'functionmsg') {
            return MessageType.FunctionMsg
          } else if (jObj.sysmsg.type === 'ilinkvoip') {
            //voip邀请
            return MessageType.Voip
          } else if (jObj.sysmsg.type === 'trackmsg') {
            //实时位置更新
          }
          break;
        default:
          return MessageType.Unknown
      }
    } catch (e) {
      return MessageType.Unknown
    }
  }
}

export class ResponseMsg {
  constructor(obj) {
    Object.assign(this, obj);
  }
  revoke () {
    return revoke(this)
  }
}
