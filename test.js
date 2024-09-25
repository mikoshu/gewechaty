const {GeweBot, Filebox, UrlLink, WeVideo, Voice, MiniApp, AppMsg, Message} = require('./dist/index.js')
const path = require('path')
const staticUrl = path.join(process.cwd(), 'static', 'download')
const WEGE_LOCAL_PROXY = ''
const WEGE_BASE_API_URL='http://192.168.0.111:2531/v2/api'
const WEGE_FILE_API_URL='http://192.168.0.111:2532/download'
const bot = new GeweBot({
  debug: true, // 是否获取回调日志 -- todo
  port: 3000, // 本地服务端口 默认3000
  proxy: WEGE_LOCAL_PROXY, // 本地代理地址用于docker在云时无法访问本地时使用 可为空 如果有则使用代理 否则使用本机ip地址
  static: 'static', // 本机静态托管的目录 用于文件下载和上传 默认为static
  route: '/wechat/callback', // 本地回调接口route 默认为 `/getWechatCallBack` 最终地址为 `http://本机ip:port//getWechatCallBack`
  base_api: WEGE_BASE_API_URL, // 基础api地址base_api 默认为 `http://本机ip:2531/v2/api`
  file_api: WEGE_FILE_API_URL, // 文件api地址base_api 默认为 `http://本机ip:2532/v2/api`,
})

const onMessage = async (msg) => {
  console.log(msg)
  const msgType = msg.type()
  const isRoom = msg.room()
  // 过滤微信团队和公众号等内容
  if(msg.isCompanyMsg()){
    console.log('公众号消息 不处理')
    return
  }
  if(!msg._pushContent.includes('屁桃君') && msg.fromId !== '53853818894@chatroom'){
    console.log('不是测试消息不处理')
    return
  }

  if(isRoom){
    msg.forward('shu581066')
    // msg.forward(await msg.from())
  }


  // 回复文本消息
  if(msgType === Message.MessageType.Text){
    // 过滤
    const text = msg.text()
    
    if(isRoom){
      // const url = `${bot.proxy}/test/test.xlsx`
      // msg.say(Filebox.fromUrl(url))
      msg.forward('shu581066')
    }else{
      // 发送消息
      // const newMsg = await msg.say(`私聊消息: ${text}`)
      // console.log(newMsg)
      // setTimeout(() => { // 撤回消息
      //   newMsg.revork()
      // }, 1000)
      // 发送消息
      // msg.say('收到消息啦')
      // // 发送图片或者文件
      // const url = `${bot.proxy}/test/test.xlsx`
      // msg.say(Filebox.fromUrl(url))
      // // 发送链接
      // const urlLink = new UrlLink({
      //   title: '测试链接',
      //   desc: '测试链接',
      //   thumbUrl: `${bot.proxy}/test/avatar.jpg`,
      //   linkUrl: 'https://www.baidu.com'
      // })
      // await msg.say(urlLink)
      // // 发送名片
      // const friend = await msg.from()
      // msg.say(friend)
      // // 发送视频
      // const video = new WeVideo({
      //   thumbUrl: `${bot.proxy}/test/avatar.jpg`,
      //   videoUrl: `${bot.proxy}/test/test2.mp4`,
      //   videoDuration: 9, // 视频时长 似乎随便传个值就行
      // })
      // msg.say(video)
      // // 发送语音
      // const voice = new Voice({
      //   voiceUrl: `${bot.proxy}/test/test2.silk`,
      //   voiceDuration: 9, // 视频时长 似乎随便传个值就行
      // })
      // msg.say(voice)
      // // 发送小程序消息
      // const miniApp = new MiniApp({
      //   "miniAppId": "wx1f9ea355b47256dd",
      //   "userName": "gh_690acf47ea05@app",
      //   "title": "最快29分钟 好吃水果送到家",
      //   "coverImgUrl": "https://che-static.vzhimeng.com/img/2023/10/30/67d55942-e43c-4fdb-8396-506794ddbdbc.jpg",
      //   "pagePath": "pages/homeDelivery/index.html",
      //   "displayName": "百果园+"
      // })
      // msg.say(miniApp)
      // 发送app
      // const appMsg = new AppMsg({
      //   "appmsg": `<appmsg appid=\"\" sdkver=\"0\">\n\t\t<title>一审宣判！蔡鄂生被判死缓</title>\n\t\t<des />\n\t\t<action />\n\t\t<type>5</type>\n\t\t<showtype>0</showtype>\n\t\t<soundtype>0</soundtype>\n\t\t<mediatagname />\n\t\t<messageext />\n\t\t<messageaction />\n\t\t<content />\n\t\t<contentattr>0</contentattr>\n\t\t<url>http://mp.weixin.qq.com/s?__biz=MjM5MjAxNDM4MA==&amp;mid=2666774093&amp;idx=1&amp;sn=aa405094dd00034d004f6e8287f86e9b&amp;chksm=bcc9d903635a9c284591edda1f027c467245d922d7d66c32d3cd2c6af1c969a7ea0896aa7639&amp;scene=0&amp;xtrack=1#rd</url>\n\t\t<lowurl />\n\t\t<dataurl />\n\t\t<lowdataurl />\n\t\t<appattach>\n\t\t\t<totallen>0</totallen>\n\t\t\t<attachid />\n\t\t\t<emoticonmd5 />\n\t\t\t<fileext />\n\t\t\t<cdnthumburl>3057020100044b304902010002048399cc8402032f57ed02041388e6720204658e922d042462666538346165322d303035382d343262322d616538322d3337306231346630323534360204051408030201000405004c53d900</cdnthumburl>\n\t\t\t<cdnthumbmd5>ea3d5e8d4059cb4db0a3c39c789f2d6f</cdnthumbmd5>\n\t\t\t<cdnthumblength>93065</cdnthumblength>\n\t\t\t<cdnthumbwidth>1080</cdnthumbwidth>\n\t\t\t<cdnthumbheight>459</cdnthumbheight>\n\t\t\t<cdnthumbaeskey>849df42ab37c8cadb324fe94ba46d76e</cdnthumbaeskey>\n\t\t\t<aeskey>849df42ab37c8cadb324fe94ba46d76e</aeskey>\n\t\t\t<encryver>0</encryver>\n\t\t</appattach>\n\t\t<extinfo />\n\t\t<sourceusername>gh_363b924965e9</sourceusername>\n\t\t<sourcedisplayname>人民日报</sourcedisplayname>\n\t\t<thumburl>https://mmbiz.qpic.cn/sz_mmbiz_jpg/xrFYciaHL08DCJtwQefqrH8JcohbOHhTpyCPab8IgDibkTv3Pspicjw8TRHnoic2tmiafBtUHg7ObZznpWocwkCib6Tw/640?wxtype=jpeg&amp;wxfrom=0</thumburl>\n\t\t<md5 />\n\t\t<statextstr />\n\t\t<mmreadershare>\n\t\t\t<itemshowtype>0</itemshowtype>\n\t\t</mmreadershare>\n\t</appmsg>`
      // })
      // msg.say(appMsg)
    }
  }else if(msgType === Message.MessageType.Image){
    // 图片消息
    // // 下载图片
    const filebox = await msg.toFileBox()
    const fileurl = path.join(staticUrl, filebox.name)
    filebox.toFile(fileurl)
    // 发送图片
    const s = await msg.say(filebox)
    setTimeout(() => {
      s.revork()
    }, 1000)
  }
}
bot.on('message', (msg) => {
  onMessage(msg)
})
bot.start().then(async () => {
  // const friend = await bot.Contact.find('shu581066')
  // friend && friend.say('hello')
}).catch(e => {
  console.log('error')
  console.error(e)
})


