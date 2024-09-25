import { SendText, SendImg, SendFile, SendUrl, 
  SendCard, SendVideo, SendVoice, revorkMsg, 
  SendMiniApp, SendAppMsg, ForwardImage, ForwardFile, 
  ForwardVideo, ForwardUrl, ForwardMiniApp } from '@/api/message.js';
import {getAppId} from '@/utils/auth.js'
import {Filebox} from '@/class/FILEBOX'
import {UrlLink} from '@/class/URLLINK'
import {Contact} from '@/class/CONTACT.js'
import {WeVideo} from '@/class/WEVIDEO.js'
import {Voice} from '@/class/VOICE.js'
import {MiniApp} from '@/class/MINIAPP.js'
import {AppMsg} from '@/class/APPMSG.js'
import {MessageType} from '@/type/MessageType'

const appId = getAppId()
// 发送消息 支持文本 图片 文件 语音 视频 小程序 app 等
export const say = async (content, toWxid, ats) => {
  try{
    console.log('say', content, toWxid, ats)
    if(typeof content === 'string'){
      return SendText({
        appId,
        content,
        toWxid,
        ats
      })
    }else if(content instanceof Filebox){ // filebox
      switch(content.type){
        case 'image':
          return SendImg({
            appId,
            imgUrl: content.url,
            toWxid,
          })
        case 'file':
          return SendFile({
            appId,
            fileUrl: content.url,
            toWxid,
            fileName: content.name
          })
        default:
          console.log('无法发送的文件类型')
      }
    }else if(content instanceof UrlLink){
      return SendUrl({
        appId,
        toWxid,
        title: content.title,
        desc: content.desc,
        linkUrl: content.linkUrl,
        thumbUrl: content.thumbUrl
      })
    }else if(content instanceof Contact){
      return SendCard({
        appId,
        toWxid,
        nickName: content._name,
        nameCardWxid: content._wxid,
      })
    }else if(content instanceof WeVideo){
      return SendVideo({
        appId,
        toWxid,
        videoUrl: content.videoUrl,
        thumbUrl: content.thumbUrl,
        videoDuration: content.videoDuration
      })
    }else if(content instanceof Voice){
      return SendVoice({
        appId,
        toWxid,
        voiceUrl: content.voiceUrl,
        voiceDuration: content.voiceDuration
      })
    }else if(content instanceof MiniApp){
      return SendMiniApp({
        appId,
        toWxid,
        miniAppId: content.miniAppId,
        displayName: content.displayName,
        pagePath: content.pagePath,
        coverImgUrl: content.coverImgUrl,
        title: content.title,
        userName: content.userName
      })
    }else if(content instanceof AppMsg){
      return SendAppMsg({
        appId,
        toWxid,
        appmsg: content.appmsg,
      })
    }else{
      throw new Error('无法发送的消息类型')
    }
  }catch(e){
    console.error(e)
  }
}
// 撤回
export const revork = async (content) => {
  return revorkMsg({
    appId,
    toWxid: content.toWxid,
    msgId: content.msgId,
    newMsgId: content.newMsgId,
    createTime: content.createTime,
  })
}

export const forward = async (content, contact, type) => {
  let toWxid = ''
  if(typeof contact ==='string'){
    toWxid = contact
  }else if( contact instanceof Contact){
    toWxid = contact._wxid
  }else{
    throw new Error('转发对象必须传入wxid或者contact对象')
  }
  switch(type){
    case MessageType.Text:
      return SendText({
        appId,
        content,
        toWxid,
        ats: ''
      })
    case MessageType.Image:
      return ForwardImage({
        appId,
        toWxid,
        xml: content
      })
    case MessageType.File:
      return ForwardFile({
        appId,
        toWxid,
        xml: content
      })
    case MessageType.Video:
      return ForwardVideo({
        appId,
        toWxid,
        xml: content
      })
    case MessageType.Link:
      return ForwardUrl({
        appId,
        toWxid,
        xml: content
      })
    case MessageType.MiniApp:
      return ForwardMiniApp({
        appId,
        toWxid,
        xml: content
      })
    default:
      console.log(type)
      console.error('无法转发的消息类型')
  }

}


// 下载文件

// export const downloadFile = async (url) => {
//   return await axios({
//     url,
//     method: 'get',
//     responseType: 'arraybuffer'
//   })
// }

