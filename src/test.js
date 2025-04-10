// 完整示例
import { GeweBot } from "@/index.js";
  
  const bot2 = new GeweBot({
    debug: true, // 是否开启调试模式 默认false
    base_api: 'http://10.20.152.211:2531/v2/api', // Gewechat启动后的基础api地址base_api 默认为 `http://本机ip:2531/v2/api`
    file_api: 'http://10.20.152.211:2532/download', // Gewechat启动后的文件api地址base_api 默认为 `http://本机ip:2532/download`,
  });
  
  // 监听消息事件
  const onMessage = async (msg) => {
    // 处理消息...
    // 回复文本消息
    if (msg.type() === bot2.Message.Type.Text) { //类型详见 MessageType 表
      await msg.say('hh');
    }
    // 处理图片消息
    if (msg.type() === bot2.Message.Type.Image) {
      if (!msg.self()) { // 同样判断图片消息是否是自己发送的
        await msg.say("收到图片");
      }
    }
  };
  
  bot2.on("message", (msg) => {
    // 此处放回的msg为Message类型 可以使用Message类的方法
    console.log(msg)
    onMessage(msg);
  });
  
  
  bot2
    .start()
    .then(async ({app, router}) => {
      /**
       * 由于本地需要启动一个web服务， 此时返回的app为一个koa创建的服务实例，
       * router为koa-router实例，因此可以给其添加新的路由事件，一般用于第三方的webhook回调
       * 让微信机器人可以通过其他三方的http请求发送通知
       *  */  
  
      // 添加一个路由用于接收其他三方的http请求 
      // 如下代码可通过请求 http://localhost:3000/sendText?text=123 则会发送消息123 给test用户
      router.get('/sendText', async (ctx) => {
        const query = ctx.request.query; // 获取 GET 请求的 query 参数
        const text = query.text; // 获取 text 参数的值
        const contact = await bot.Contact.find({name: 'test'}) // 获取联系人
        contact.say(text)
        ctx.body = '发送成功'
      })
      app.use(router.routes()).use(router.allowedMethods());
      
      // 通过bot实例做相关操作
      // const info = await bot.info() // 获取当前登录微信的个人信息
      // console.log(info)
  
      // const qrcode = await bot.qrcode() // 获取当前登录微信的二维码 base64
      // console.log(qrcode)
  
      // await bot.setInfo({ // 当前登录微信的设置个人信息
      //   "city": "Fuzhou", // 城市
      //   "country": "CN", // 国家
      //   "nickName": "test", //昵称
      //   "province": "Fujian", //省份
      //   "sex": 1, //性别 1:男 2:女
      //   "signature": "......" // 个性签名
      // })
  
      // // 设置隐私
      // // 4:加我为朋友时需要验证  7:向我推荐通讯录朋友 8:添加我的方式 手机号 25:添加我的方式 微信号 38:添加我的方式 群聊 39:添加我的方式 我的二维码 40:添加我的方式 名片
      // await bot.setPrivacy({
      //   option: 4, //
      //   open: true //开关
      // })
  
      // // 设置头像
      // await bot.setAvatar('https://wx.qlogo.cn/mmhead/ver_1/REoLX7KfdibFAgDbtoeXGNjE6sGa8NCib8UaiazlekKjuLneCvicM4xQpuEbZWjjQooSicsKEbKdhqCOCpTHWtnBqdJicJ0I3CgZumwJ6SxR3ibuNs/0') // 设置头像
  
      // const list = await bot.deviceList() // 获取设备记录
      // console.log(list)
  
  
      // // 通过手机号添加好友
      // const contact = await bot.Friendship.search('150*******4')
      // bot.Friendship.add(contact, 'ding')
  
      // // 查找联系人方法
      // const friend = await bot.Contact.find({name: 'test'}) // 使用昵称查询
      // const friend2 = await bot.Contact.find({alias: 'test1'}) // 使用备注查询 
      // const friend3 = await bot.Contact.find({id: 'wxid_xxxxx'}) // 直接使用wxid查询
      // friend && friend.say('hello') // 给查询到的联系人发送消息
  
    })
    .catch((e) => {
      console.error(e);
    });