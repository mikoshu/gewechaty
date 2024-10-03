import {GetMyInfo, GetMyQrcode, SetInfo, SetPrivacy, SetAvatar, GetDevices} from '@/api/personal.js'
import {getAppId} from '@/utils/auth.js'

// const appId = getAppId()

export const getMyInfo = async () => {
  return GetMyInfo({
    appId: getAppId()
  })
}

export const getMyQrcode = async () => {
  return GetMyQrcode({
    appId: getAppId()
  })
}

export const setMyInfo = async (data) => {
  return SetInfo({
    appId: getAppId(),
   ...data
  })
}

export const setPrivacy = async (data) => {
  return SetPrivacy({
    appId: getAppId(),
    ...data
  })
}

export const setAvatar = async (url) => {
  return SetAvatar({
    appId: getAppId(),
    headImgUrl: url
  })
}

export const getDevices = async () => {
  return GetDevices({
    appId: getAppId()
  })
}