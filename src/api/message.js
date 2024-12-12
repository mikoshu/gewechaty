import {post} from '@/request/request.js'

export const SendText = (data, config) => {
  return post('/message/postText', data, config)
}

export const SendImg = (data, config) => {
  return post('/message/postImage', data, config)
}

export const SendFile = (data, config) => {
  return post('/message/postFile', data, config)
}

export const SendUrl = (data, config) => {
  return post('/message/postLink', data, config)
}

export const SendCard = (data, config) => {
  return post('/message/postNameCard', data, config)
}

export const SendVideo = (data, config) => {
  return post('/message/postVideo', data, config)
}

export const SendVoice = (data, config) => {
  return post('/message/postVoice', data, config)
}

export const SendMiniApp = (data, config) => {
  return post('/message/postMiniApp', data, config)
}

export const SendAppMsg = (data, config) => {
  return post('/message/postAppMsg', data, config)
}

export const SendEmoji = (data, config) => {
  return post('/message/postEmoji', data, config)
}

export const revokeMsg = (data, config) => {
  return post('/message/revokeMsg', data, config)
}

export const ForwardImage = (data, config) => {
  return post('/message/forwardImage', data, config)
}

export const ForwardFile = (data, config) => {
  return post('/message/forwardFile', data, config)
}

export const ForwardVideo = (data, config) => {
  return post('/message/forwardVideo', data, config)
}

export const ForwardUrl = (data, config) => {
  return post('/message/forwardUrl', data, config)
}

export const ForwardMiniApp = (data, config) => {
  return post('/message/forwardMiniApp', data, config)
}

