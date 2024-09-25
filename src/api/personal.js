import {post} from '@/request/request.js'

export const getMyInfo = (data, config) => {
  return post('/personal/getProfile', data, config)
}