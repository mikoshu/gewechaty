import { say, getWxId } from '@/action/common.js';
import {inviteMember, delMember, findAll, find, 
  changeRoomName, getAnnouncement, setAnnouncement, getQrcode, setRoomNickName,
  getRoomMemberInfo, getRoomMemberList, createRoom, quitRoom, updateRoomInfo} from '@/action/room.js'
import {getContact} from '@/action/contact.js'
import {ResponseMsg} from '@/class/MESSAGE.js'
import {Contact} from '@/class/CONTACT.js'
import {Filebox} from '@/class/FILEBOX'
import {roomEmitter} from '@/bot.js'

export class Room {
  constructor(data) {
    this.chatroomId = data.chatroomId; // 房间ID
    this.name = data.nickName || ""; // 房间话题
    this.remark = data.remark || ""; // 房间备注
    this.chatRoomNotify = data.chatRoomNotify; // 是否通知
    this.chatRoomOwner = data.chatRoomOwner; // 房间拥有者
    this.isNotify = Boolean(data.chatRoomNotify)
    this.OwnerId = data.chatRoomOwner
    this.avatarImg = data.smallHeadImgUrl || data.bigHeadImgUrl
    this.memberList = data.memberList || []
  }
  // 实例方法
  async sync() {
    // 同步房间信息
    return updateRoomInfo(this.chatroomId);
  }
  async say (textOrContactOrFileOrUrl, ats) { // 回复消息
    const res = await say(textOrContactOrFileOrUrl, this.chatroomId, ats)
    return new ResponseMsg(res)
  }

  on(event, listener) {
    // 绑定事件处理
    console.log('绑定事件处理', `${event}:${this.chatroomId}`)
    roomEmitter.on(`${event}:${this.chatroomId}`, listener, true);
  }

  async add(contact, reason = '') { //ok
    // 添加成员
    let to = getWxId(contact)
    return inviteMember(to, this.chatroomId, reason)
  }

  async del(contact) { //ok
    // 删除成员
    let to = getWxId(contact)
    return delMember(to, this.chatroomId)
  }

  async quit() { //todo
    // 退出房间
    return quitRoom(this.chatroomId)
  }

  async topic(newTopic) { //ok
    // 修改房间话题
    if(!newTopic){
      return this.name
    }
    return changeRoomName(this.chatroomId, newTopic)
  }

  async announce(text) { // ok
    // 设定公告
    if(!text){
      return getAnnouncement(this.chatroomId)
    }else{
      return setAnnouncement(this.chatroomId, text)
    }
  }

  async qrcode() { // todo
    // 返回房间的二维码
    return getQrcode(this.chatroomId)
  }

  async alias(contact) { // ok
    // 获取成员别名
    const data = await getRoomMemberInfo(this.chatroomId, contact._wxid)
    return data?.displayName || null
  }

  async has(contact) { // 是否通过memberflag判断？
    // 检查房间是否有某个成员
    const data = await getRoomMemberInfo(this.chatroomId, contact._wxid)
    if(data === null){
      return false
    }else{
      return true
    }
  }

  async memberAll(query) {
    // 获取符合查询的所有成员
    const {memberList} = await getRoomMemberList(this.chatroomId)
    if(memberList.length === 0){
      return []
    }
    if(!query){
      return memberList.map(item => {
        return new Contact(item)
      })
    }
    const arr = []
    memberList.map(item => {
      if(item.nickName === query || item.displayName === query){
        arr.push(new Contact(item)) 
      }
    })
    return arr
  }

  async member(query) {
    // 获取单个成员
    const {memberList} = await getRoomMemberList(this.chatroomId)
    if(memberList.length === 0){
      return null
    }
    for(let item of memberList){
      if(item.nickName === query || item.displayName === query){
        return new Contact(item)
      }
    }
    return null
  }

  async owner() {
    // 获取房间的拥有者
    return getContact(this.OwnerId);
  }

  async avatar() {
    // 返回房间的头像
    return new Promise((resolve) => {
      const filebox = Filebox.toDownload(this.avatarImg, 'image', 'avatar.jpg');
      resolve(filebox);
    });
  }


  async rename(name){ // 设置我的群昵称
    if(!name){
      console.log('输入的昵称不能为空')
      return this.name
    }
    return setRoomNickName(this.chatroomId, name)
  }

  // 静态方法

  static async create(contactList, topic) {
    // 创建房间
    return createRoom(contactList, topic)
  }

  static async findAll(query) {
    // 查询符合条件的房间
    return findAll(query)
  }

  static async find(query) {
    // 查询单个符合条件的房间
    return find(query)
  }
}

