import {post} from '@/request/request.js'

export const GetMyInfo = (data, config) => {
  return post('/personal/getProfile', data, config)
}

export const GetMyQrcode = (data, config) => {
  return post('/personal/getQrCode', data, config)
}

export const SetInfo = (data, config) => {
  return post('/personal/updateProfile', data, config)
}

export const SetPrivacy = (data, config) => {
  return post('/personal/privacySettings', data, config)
}

export const SetAvatar = (data, config) => {
  return post('/personal/updateHeadImg', data, config)
}

export const GetDevices = (data, config) => {
  return post('/personal/getSafetyInfo', data, config)
}

