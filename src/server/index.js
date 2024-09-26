import koa from 'koa'
import koaRouter from 'koa-router'
import bodyParser from 'koa-bodyparser'
import serve from 'koa-static'
import { join } from 'path';
import {setUrl} from '@/action/setUrl.js'
import {login} from '@/action/login.js'
import {CheckOnline} from '@/api/login'
import { getLocalIPAddress } from "@/utils/index.js";
import {Message} from '@/class/MESSAGE.js'
import { botEmitter } from '@/bot.js'
import { getAppId } from '@/utils/auth.js';
export const bot = botEmitter

const ip = getLocalIPAddress()
const app = new koa()
const router = new koaRouter()
// 使用 bodyParser 解析 POST 请求的 body

export const startServe = (option) => {
  // 启动服务
  let callBackUrl = `http://${ip}:${option.port}${option.route}`
  if(option.proxy){
    callBackUrl = `${option.proxy}${option.route}`
  }
  // 设置文件保存目录
  app.use(serve(join(process.cwd(), option.static)))

  // 定义一个接口，能够同时处理 GET 和 POST 请求
  router.post(option.route, (ctx) => {
    try{
      const body = ctx.request.body; // 获取 POST 请求的 body 数据
      console.log('POST 请求的数据:', body);
      if(body && body.TypeName === 'Offline'){
        console.log('掉线咯！！！')
      }

      // 判断是否是微信消息
      if(body.Appid && body.TypeName === 'AddMsg'){
        // 消息hanlder
        const msg = new Message(body)
        // 发送消息
        bot.emit('message', msg)
      }
      
    }catch(e){
      console.error(e)
    }
    ctx.body = "SUCCESS";
  }).get(option.route, (ctx) => {
    const query = ctx.request.query; // 获取 GET 请求的 query 参数
    console.log('GET 请求的数据:', query);
    ctx.body = "SUCCESS";
  });
  app.use(bodyParser());
  app.use(router.routes())
  app.use(router.allowedMethods())
  
  return new Promise((resolve, reject) => {
    app.listen(option.port, async (err) => {
      if(err){
        reject(err)
        process.exit(1);
      }

      try{
        const isOnline = await CheckOnline({
          appId: getAppId()
        })
        if(isOnline && isOnline.ret !== 200){
          console.log('未登录')
          await login()
        }
        const res = await setUrl(callBackUrl)
        if(res.ret === 200){
          console.log(`设置回调地址为：${callBackUrl}`)
          console.log('服务启动成功')
          resolve(app)
        }else{
          console.log('回调地址设置失败，请确定gewechat能访问到回调地址网络')
          reject(res)
          process.exit(1);
        }
      }catch(e){
        console.log('服务启动失败')
        reject(e)
        process.exit(1);
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
