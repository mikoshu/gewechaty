import {startServe, bot} from '@/server/index'
import {setBaseUrl} from '@/request/request.js'
import {setFileUrl} from '@/request/fileRequest.js'
import {Contact} from '@/class/CONTACT.js'
export {Filebox} from '@/class/FILEBOX.js'
export {UrlLink} from '@/class/URLLINK.js'
export {WeVideo} from '@/class/WEVIDEO.js'
export {Voice} from '@/class/VOICE.js'
export {Emoji} from '@/class/EMOJI.js'
export {MiniApp} from '@/class/MINIAPP.js'
export {AppMsg} from '@/class/APPMSG.js'
export {Contact} from '@/class/CONTACT.js'
import {Message} from '@/class/MESSAGE.js'
import {Room} from '@/class/ROOM.js'
import { getLocalIPAddress } from "@/utils/index.js";
import {logout, login} from '@/action/login.js'
import { Friendship } from './class/FRIENDSHIP'
import {getMyInfo, getMyQrcode, setMyInfo, setPrivacy, setAvatar, getDevices} from '@/action/personal.js'
import {createDS, getAppId, getToken, getUuid} from '@/utils/auth.js'
import {db} from '@/sql/index.js'
import {cacheAllContact} from '@/action/contact.js'
import { join } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs'

function getDefaultDataPath() {
  const dsPath = join(process.cwd(), 'ds.json')
  return existsSync(dsPath) ? process.cwd() : join(process.cwd(), 'data')
}

export class GeweBot {
  constructor(option = {}) {
    // 初始化配置
    Object.assign(this, option)
    const ip = option.ip || getLocalIPAddress()
    this.port = this.port || 3000;
    this.static = this.static ||'static';
    this.proxy = this.proxy || `http://${ip}:${this.port}`;
    this.base_api = this.base_api || `http://${ip}:2531/v2/api`;
    this.file_api = this.file_api || `http://${ip}:2532/download`;
    this.route = this.route || '/getWechatCallBack'
    this.use_cache = true
    this.debug = this.debug || false
    this.data_dir = this.data_dir || getDefaultDataPath()
    // 初始化类
    this.Contact = Contact;
    this.Room = Room
    this.Friendship = Friendship
    this.Message = Message
    this.db = db
    // 初始化事件监听器

    // 初始化数据存储
    // Create data directory if it doesn't exist
    if (!existsSync(this.data_dir)) {
      mkdirSync(this.data_dir, { recursive: true })
    }
    createDS(this.data_dir)
  }
  async start(){
    setBaseUrl(this.base_api)
    setFileUrl(this.file_api)
    // 启动服务
    return await startServe(this)
  }
  on(eventName, callback) {
    bot.on(eventName, callback)
  }
  login(){ // return boolean
    // 登录
    return login()
  }
  logout(){ // return boolean
    // 退出登录
    return logout()
  }
  async info(){ // 获取个人信息
    return await getMyInfo()
  }
  async qrcode(){ // 获取二维码
    return await getMyQrcode()
  }
  getAppId(){ // 获取appid
    return getAppId()
  }
  getToken(){ // 获取token
    return getToken()
  }
  getUuid(){ // 获取uuid
    return getUuid()
  }
  setInfo(info){ // 设置个人信息
    return setMyInfo(info)
  }
  setPrivacy(privacy){ // 设置隐私
    return setPrivacy(privacy)
  }
  setAvatar(avatar){ // 设置头像
    return setAvatar(avatar)
  }
  deviceList(){ // 获取设备列表
    return getDevices()
  }
 
  async refreshContactCache(){ // 刷新联系人缓存
    return await cacheAllContact()
  }
}