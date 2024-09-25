import {post} from '@/request/request.js'

export const getSimpleInfo = (data, config) => {
  return post('/contacts/getBriefInfo', data, config)
}

export const getInfo = (data, config) => {
  return post('/contacts/getDetailInfo', data, config)
}

export const setFriendRemark = (data, config) => {
  return post('/contacts/setFriendRemark', data, config)
}

export const findContact = (data, config) => {
  return post('/contacts/search', data, config)
}

