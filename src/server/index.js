import koa from 'koa'
import * as koaRouter from 'koa-router'
const { bodyParser } = require("@koa/bodyparser");
import JSONbig from 'json-bigint'
import serve from 'koa-static'
import * as fsPromise from 'node:fs/promises'
import { join } from 'path';
import {setUrl} from '@/action/setUrl.js'
import {login, reconnection, getToken as getTokenFromDocker} from '@/action/login.js'
import {cacheAllContact} from '@/action/contact'
import {setCached} from '@/action/common'
import {CheckOnline} from '@/api/login'
import { getLocalIPAddress, compareMemberLists, getAttributesFromXML } from "@/utils/index.js";
import {Message} from '@/class/MESSAGE.js'
import {Contact} from '@/class/CONTACT.js'
import {Room} from '@/class/ROOM.js'
import { botEmitter, roomEmitter } from '@/bot.js'
import {db} from '@/sql/index.js'
import {MessageType} from '@/type/MessageType'
import {RoomInvitation} from '@/class/ROOMINVITATION.js'
import {getRoomLiveInfo} from '@/action/room.js'
import { Friendship } from '@/class/FRIENDSHIP';
import * as ds from '@/utils/auth';
export const bot = botEmitter
export let staticUrl = 'static'
export let proxyUrl = ''
const ip = getLocalIPAddress()
const app = new koa()
const router = new koaRouter()
// 使用 bodyParser 解析 POST 请求的 body

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.use(bodyParser());


export const startServe = async (option) => {
  // 启动服务
  var cbip = option.ip || ip;
  let callBackUrl = `http://${cbip}:${option.port}${option.route}`
  if(option.proxy){
    callBackUrl = `${option.proxy}${option.route}`
  }
  proxyUrl = option.proxy
  // 设置文件保存目录
  app.use(serve(join(process.cwd(), option.static)))
  staticUrl = join(process.cwd(), option.static)


  // 定义一个接口，能够同时处理 GET 和 POST 请求
  router.post(option.route, async (ctx) => {
    try{
      const body = JSONbig({ storeAsString: true }).parse(ctx.request.rawBody); // 获取 POST 请求的 body 数据
      // 兼容新版本 key 值变化
      body.Appid = body.Appid || body.appid
      body.TypeName = body.TypeName || body.type_name
      body.Data = body.Data || body.data

      if(option.debug){
        console.log(body);
      }
      // all 事件
      bot.emit('all', body)
      
      if(body && body.TypeName === 'Offline'){
        for (let i = 0; i < 3; i++) {
          console.log('连接断开，5 秒后将尝试重连...')
          await delay(5000)
          const s = await reconnection()
          if(s){
            console.log('重连成功')
            break
          }
        }
        throw new Error('断线重连失败达 3 次,请重新登录！')
      }

      // 判断是否是微信消息
      if(body.Appid && body.TypeName === 'AddMsg'){ // 大部分消息类型都为 AddMsg
        // 消息hanlder
        const msg = new Message(body)
        // 发送消息
        const type = msg.type()
        if(type === MessageType.RoomInvitation){ // 群邀请
          let obj = Message.getXmlToJson(msg.text())
          obj.fromId = msg.fromId
          bot.emit(`room-invite`, new RoomInvitation(obj))
        }else if(type === MessageType.AddFriend){ // 好友请求
          let obj = getAttributesFromXML(msg.text())
          bot.emit('friendship', new Friendship(obj))
        }else if(type === MessageType.Revoke){ // 消息撤回
          bot.emit('revoke', msg)
        }else{
          bot.emit('message', msg)
        }
      }else if(body && body.TypeName === 'ModContacts'){ // 好友消息， 群信息变更
        // 消息hanlder
        const id = body.Data?.UserName?.string||''
        if(id.endsWith('@chatroom')){ // 群消息
          const oldInfo = db.findOneByChatroomId(id)
          const newInfo = await getRoomLiveInfo(id)
          // 群聊200人以上无法直接扫码进群，需要邀请，因此增加特殊处理
          if (oldInfo.memberList.length >= 200 || body.Data?.ImgFlag!=1) {
            // 比较成员列表
            const obj = compareMemberLists(oldInfo.memberList, newInfo.memberList)
            if(obj.added.length > 0){
              obj.added.map((item) => {
                const member = new Contact(item)
                roomEmitter.emit(`join:${id}`, new Room(newInfo), member, member.inviterUserName)
              })
            }
            if(obj.removed.length > 0){
              obj.removed.map((item) => {
                const member = new Contact(item)
                roomEmitter.emit(`leave:${id}`, new Room(newInfo), member)
              })
            }
            
            if(body.Data.NickName.string !== oldInfo.nickName){ // 群名称变动
              roomEmitter.emit(`topic:${id}`, new Room(newInfo), body.Data.NickName.string, oldInfo.nickName)
            }
            db.updateRoom(id, newInfo)
          }
        }
      }else{
        bot.emit('other', body)
      }

      // "TypeName": "ModContacts", 好友消息， 群信息变更 
      // "TypeName": "DelContacts" 删除好友
      // "TypeName": "DelContacts" 退出群聊
      
    }catch(e){
      console.error(e)
    }
    ctx.body = "SUCCESS";
  }).get(option.route, (ctx) => {
    const query = ctx.request.query; // 获取 GET 请求的 query 参数
    console.log('GET 请求的数据:', query);
    ctx.body = "SUCCESS";
  });

  // app.use(bodyParser());
  
  
  
  return new Promise((resolve, reject) => {
    app.listen(option.port, async (err) => {
      // 启动服务失败
      if(err){
        throw err
      }

      /** 用于保存登录状态 */
      let onlineStatus = { ret: 200, data: false }

      // 先从 DS 和 Docker 获取 token / appid
      const oldAppId = ds.getAppId()
      const oldToken = ds.getToken()
      const currentToken = await getTokenFromDocker()

      if (oldToken !== currentToken) { // token 变化，意味着 Docker 状态被重置
        console.log('Docker 状态被重置，程序将迁移数据，需要重新登录...')

        // 储存新的 token
        ds.setToken(currentToken)

        // 状态被重置后，appid 失效，所以在 DS 中清空
        ds.setAppId('')
      } else if (oldAppId) { // 若已经设置 appid，通过 CheckOnline 接口验证当前登录状态
        onlineStatus = await CheckOnline({
          appId: ds.getAppId()
        })
      } else {
        console.log('未设置 appid，启动登录流程...')
      }

      // 若无法获取到登录状态，则进入登录流程
      if(onlineStatus.ret === 200 && onlineStatus.data === false){
        await login().then((res) => {
          if (!res) { // TODO: 登录逻辑应该把错误原因抛出，而不是返回 false
            throw new Error('登录遇到问题')
          }
        }).catch((e) => { // 无论是上一段抛出的错误，还是 login() 抛出的，都会进入这里
          console.error('登录失败：\n', e)
          throw e // 会被直接抛出 startServe 以外，阻止后续代码执行
        })
      }

      // 登录成功后，获取当前 appid，并拼接数据库路径
      const currentAppId = ds.getAppId()
      let dbPath
      if (option.dbFileName !== undefined) {
        dbPath = join(option.data_dir, option.dbFileName + '.db')
      } else {
        dbPath = join(option.data_dir, currentAppId + '.db')
      }

      // 如果数据库文件不存在，需要初始化数据库
      if(!db.exists(dbPath)){
        // 如果之前 token 被重置过，将尝试修改缓存数据库文件名，以避免重新生成数据库
        // 如果 appid 被清空，上面的登录逻辑会通过以下链条确保 appid 被重新生成且被存入 DS：
        // login() ->
        // showQrcode() [to get appid via `(await GetQrcode()).data.appId`] ->
        // setAppId()
        if (oldToken !== currentToken && db.exists(join(option.data_dir, oldAppId + '.db'))) { // token 变化，且旧数据库文件存在
            // 用拷贝-删除替代重命名，以避免旧的数据库文件被占用导致无法重命名
            await fsPromise.copyFile(join(option.data_dir, oldAppId + '.db'), dbPath)
            // 删除失败只会在控制台输出错误，不会影响程序运行
            fsPromise.rm(join(option.data_dir, oldAppId + '.db')).catch(console.error)

            // 连接数据库
            db.connect(dbPath)
            console.log('成功迁移旧的数据缓存，启用缓存')
        } else { // 否则视作首次登录，直接创建数据库
          console.log('创建本地数据库，启用缓存')
          console.log('本地数据初始化，可能需要耗费点时间，耐心等待...')

          // 连接数据库，这一情况下由于数据库文件不存在，会自动创建数据库文件
          db.connect(dbPath)

          // 创建数据表
          db.createContactTable()
          db.createRoomTable()

          // 防止异步
          // NOTE: 上面两个函数调用的 this.db.exec 好像是同步的，不应该需要 delay？待确认……
          await delay(1000)

          // 缓存所有联系人并保存到本地数据库
          await cacheAllContact()
          console.log('数据初始化完毕')
        }
      } else {
        db.connect(dbPath)
        console.log('存在缓存数据，启用缓存')
      }
      setCached(true) // NOTE: 对应的状态好像没用上
        
      // 此时再启用回调地址 防止插入数据时回调
      app.use(router.routes())
      app.use(router.allowedMethods())

      // 为 Docker 设置回调地址
      const res = await setUrl(callBackUrl)
      if (res.ret === 200) {
        console.log(`设置回调地址为：${callBackUrl}`)
        console.log('服务启动成功')
        resolve({app, router})
      } else { // 回调 API 对于 Docker 而言不可达
        throw new Error('回调地址设置失败，请确定 Gewechat 能访问到回调地址: ' + callBackUrl, { detail: res })
      }
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        reject(`Port ${option.port} is already in use. Please use a different port.`);
      } else {
        reject(`Server error: ${err}`);
      }
    });
  })
}
