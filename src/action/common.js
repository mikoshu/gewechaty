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
import {db} from '@/sql/index.js'

export let isCached = false

export const setCached = (value) => {
  isCached = value
}

export const getCached = () => {
  return isCached
}

// const appId = getAppId()

// 检查是否是 Contact 类组成的数组
function isArrayOfContact(arr) {
  // 先判断是否是数组
  if (!Array.isArray(arr)) {
    return false;
  }
  // 判断数组中的每个元素是否是 Contact 的实例
  return arr.every(item => item instanceof Contact);
}

function isArrayOfString(arr) {
  // 先判断是否是数组
  if (!Array.isArray(arr)) {
    return false;
  }
  // 判断数组中的每个元素是否是 string
  return arr.every(item => typeof item === 'string');
}

// 发送消息 支持文本 图片 文件 语音 视频 小程序 app 等
export const say = async (content, toWxid, ats) => {
  try{
    if(typeof content === 'string'){ // 处理文本消息
      let atString = ''
      if(ats && toWxid.endsWith('@chatroom')){ // 处理ats 支持单个和多个
        const room = db.findOneByChatroomId(toWxid)
        let flag = false
        if(ats === '@all'){
          atString = 'notify@all'
          content = '@所有人 '+content
          flag = true
        }
        if(ats instanceof Contact){
          atString = ats._wxid
          let name = ''
          room.memberList.find(item => {
            if(item.wxid === ats._wxid){
              name = item.displayName
            }
          })
          name = name || ats.name()
          content = `@${name} ` + content
          flag = true
        }
        if(isArrayOfContact(ats)){ // 多个通知用户
          atString = ats.map(item => item._wxid).join(',')
          const start = ats.map(item => {
            let name = ''
            room.memberList.find(member => {
              if(member.wxid === item._wxid){
                name = member.displayName
              }
            })
            return `@${name || item.name()}`
          }).join(' ')
          content = start + ' ' + content
          flag = true
        }
        if(!flag){
          console.log('无法发送的ats类型')
        }
      }
      return SendText({
        appId: getAppId(),
        content,
        toWxid,
        ats: atString
      })
    }else if(content instanceof Filebox){ // filebox
      switch(content.type){
        case 'image':
          return SendImg({
            appId: getAppId(),
            imgUrl: content.url,
            toWxid,
          })
        case 'file':
          return SendFile({
            appId: getAppId(),
            fileUrl: content.url,
            toWxid,
            fileName: content.name
          })
        default:
          console.log('无法发送的文件类型')
      }
    }else if(content instanceof UrlLink){
      return SendUrl({
        appId: getAppId(),
        toWxid,
        title: content.title,
        desc: content.desc,
        linkUrl: content.linkUrl,
        thumbUrl: content.thumbUrl
      })
    }else if(content instanceof Contact){
      return SendCard({
        appId: getAppId(),
        toWxid,
        nickName: content._name,
        nameCardWxid: content._wxid,
      })
    }else if(content instanceof WeVideo){
      return SendVideo({
        appId: getAppId(),
        toWxid,
        videoUrl: content.videoUrl,
        thumbUrl: content.thumbUrl,
        videoDuration: content.videoDuration
      })
    }else if(content instanceof Voice){
      return SendVoice({
        appId: getAppId(),
        toWxid,
        voiceUrl: content.voiceUrl,
        voiceDuration: content.voiceDuration
      })
    }else if(content instanceof MiniApp){
      return SendMiniApp({
        appId: getAppId(),
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
        appId: getAppId(),
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
    appId: getAppId(),
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
        appId: getAppId(),
        content,
        toWxid,
        ats: ''
      })
    case MessageType.Image:
      return ForwardImage({
        appId: getAppId(),
        toWxid,
        xml: content
      })
    case MessageType.File:
      return ForwardFile({
        appId: getAppId(),
        toWxid,
        xml: content
      })
    case MessageType.Video:
      return ForwardVideo({
        appId: getAppId(),
        toWxid,
        xml: content
      })
    case MessageType.Link:
      return ForwardUrl({
        appId: getAppId(),
        toWxid,
        xml: content
      })
    case MessageType.MiniApp:
      return ForwardMiniApp({
        appId: getAppId(),
        toWxid,
        xml: content
      })
    default:
      console.log(type)
      console.error('无法转发的消息类型')
  }

}

export const getWxId = (content) => {
  if(typeof content ==='string'){
    return content
  }else if(content instanceof Contact){
    return content._wxid
  }else{
    throw new Error('获取wxid必须传入string或者contact对象')
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

