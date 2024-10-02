import {GetMyInfo, GetMyQrcode, SetInfo, SetPrivacy, SetAvatar, GetDevices} from '@/api/personal.js'
import {getAppId} from '@/utils/auth.js'

const appId = getAppId()

export const getMyInfo = async () => {
  return GetMyInfo({
    appId
  })
}

export const getMyQrcode = async () => {
  return GetMyQrcode({
    appId
  })
}

export const setMyInfo = async (data) => {
  return SetInfo({
    appId,
   ...data
  })
}

export const setPrivacy = async (data) => {
  return SetPrivacy({
    appId,
    ...data
  })
}

export const setAvatar = async (url) => {
  return SetAvatar({
    appId,
    headImgUrl: url
  })
}

export const getDevices = async () => {
  return GetDevices({
    appId
  })
}