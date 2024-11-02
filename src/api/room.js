import {post} from '@/request/request.js'

export const GetRoomInfo = (data, config) => {
  return post('/group/getChatroomInfo', data, config)
}

export const InviteMember = (data, config) => {
  return post('/group/inviteMember', data, config)
}

export const DelMember = (data, config) => {
  return post('/group/removeMember', data, config)
}

export const ChangeRoomName = (data, config) => {
  return post('/group/modifyChatroomName', data, config)
}

export const GetAnnouncement = (data, config) => {
  return post('/group/getChatroomAnnouncement', data, config)
}

export const SetAnnouncement = (data, config) => {
  return post('/group/setChatroomAnnouncement', data, config)
}

export const GetRoomMemberInfo = (data, config) => {
  return post('/group/getChatroomMemberDetail', data, config)
}

export const GetRoomMemberList = (data, config) => {
  return post('/group/getChatroomMemberList', data, config)
}

export const CreateRoom = (data, config) => {
  return post('/group/createChatroom', data, config)
}

export const QuitRoom = (data, config) => {
  return post('/group/quitChatroom', data, config)
}

export const GetQrcode = (data, config) => {
  return post('/group/getChatroomQrCode', data, config)
}

export const JoinRoom = (data, config) => {
  return post('/group/agreeJoinRoom', data, config)
}

export const SetRoomNickName = (data, config) => {
  return post('/group/modifyChatroomNickNameForSelf', data, config)
}