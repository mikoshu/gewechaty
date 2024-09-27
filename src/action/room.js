import {GetRoomInfo, InviteMember, DelMember} from '@/api/room.js'
import {Room} from '@/class/ROOM.js'
import {getAppId} from '@/utils/auth.js'

const appId = getAppId()

export const getRoomInfo = async (roomId) => {
  const data = {
    appId,
    chatroomId: roomId,
  }
  const res = await GetRoomInfo(data)
  const room = new Room(res)
  return room
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




