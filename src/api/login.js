import {post} from '@/request/request.js'


export const GetToken = (data, config) => {
  return post('/tools/getTokenId', data, config)
}

export const GetQrcode = (data, config) => {
  return post('/login/getLoginQrCode', data, config)
}

export const CheckLogin = (data, config) => {
  return post('/login/checkLogin', data, config)
}

export const SetCallBackUrl = (data, config) => {
  return post('/tools/setCallback', data, config)
}

export const CheckOnline = (data, config) => {
  return post('/login/checkOnline', data, config)
}


// export const MobileRegist = (data: MobileRegistParams, config: configParams = {}) => {
//   data.passWord = setPassword(data.passWord)
//   return basePost(`/auth/register`, data, config)
// }