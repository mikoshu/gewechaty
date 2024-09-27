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