import {GetRoomInfo, InviteMember, DelMember, ChangeRoomName, GetAnnouncement, SetAnnouncement} from '@/api/room.js'
import {Room} from '@/class/ROOM.js'
import {getAppId} from '@/utils/auth.js'
import {db} from '@/sql/index.js'
import {getCached} from '@/action/common.js'
const appId = getAppId()

export const getRoomInfo = async (roomId) => {
  let room = null
  room = db.findOneByChatroomId(roomId)
  if(!room){ // 缓存中没有数据则从接口获取
    room = await GetRoomInfo({
      appId,
      chatroomId: roomId,
    })
    if(room){
      db.insertRoom(room)
    }
  }
  
  return new Room(room)
}

export const inviteMember = async (wxids, chatroomId, reason = '') => {
  return InviteMember({
    appId,
    wxids,
    chatroomId,
    reason
  })
}

export const delMember = async (wxids, chatroomId) => {
  return DelMember({
    appId,
    wxids,
    chatroomId
  })
}


export const find = async (query) => {
  let room = null
  if(typeof query ==='string'){
    room = db.findOneByChatroomId(query)
  }else if(typeof query ==='object'){
    if(query.topic){
      room = db.findOneByChatroomName(query.topic)
    }else{
      console.log('不支持的查询内容')
      return null
    }
  }
  return room? new Room(room) : null
}


export const findAll = async (query) => {
  let arr = []
  let rows = []
  if(!query){
    rows = db.findAllRooms()
  }else if(typeof query ==='object'){
    if(query.topic){
      rows = db.findAllByChatroomName(query.topic)
    }else{
      console.log('不支持的查询内容')
      return arr
    }
  }
  rows.map(item => {
    arr.push(new Room(item))
  })
  return arr
}

export const changeRoomName = async (chatroomId, chatroomName) => {
  return ChangeRoomName({
    appId,
    chatroomId,
    chatroomName
  })
}

export const getAnnouncement = async (chatroomId) => {
  return GetAnnouncement({
    appId,
    chatroomId
  })
}

export const setAnnouncement = async (chatroomId, content) => {
  return SetAnnouncement({
    appId,
    chatroomId,
    content
  })
}
