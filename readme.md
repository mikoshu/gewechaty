# gewechaty

## 一、简介

gewechaty 是基于[Gewechat](https://github.com/Devo919/Gewechat?tab=readme-ov-file)项目的二次封装，提供了更方便的使用方式。参考 wechaty 的 api 实现，以满足更快速开发的需求（由于gewechat接口限制无法完全平滑迁移只是提供更便捷的使用方法，如有些同步的方法需要改为异步）。

本项目基于 [Gewechat](https://github.com/Devo919/Gewechat?tab=readme-ov-file)，请先确认 Gewechat 已经能够正常启动，否则无法使用本插件。

感谢群里大佬 `@1H` 重构了镜像，让gewe镜像不依赖cgroup和docker --privilege可以在更高版本的ubuntu，debian以及macos系统上运行。
镜像地址 `ghcr.io/tu1h/wechotd/wechotd:alpine`或`registry.cn-chengdu.aliyuncs.com/tu1h/wechotd:alpine`
导入重构后的镜像

```bash
  docker pull registry.cn-chengdu.aliyuncs.com/tu1h/wechotd:alpine
  docker tag registry.cn-chengdu.aliyuncs.com/tu1h/wechotd:alpine gewe
```
运行镜像容器

```bash
  mkdir -p /root/temp
  docker run -itd -v /root/temp:/root/temp -p 2531:2531 -p 2532:2532 --name=gewe gewe
  #将容器设置成开机运行
  docker update --restart=always gewe
```

- 项目不断完善中，请务必使用最新版本。
- 将在项目运行根目录创建一个ds.json 用于存储 appid token 和uuid 同时创建 ${appid}.db 用于缓存联系人和群信息，以确保可以使用联系人昵称和群名称查询相关信息，无需直接使用wxid查询， 如果确实需要使用wxid查询可以直接传入wxid，如`bot.Contact.find({id: 'wxid_xxxx'})`。
- 注意如果本地没有ds.json文件将会以空的appid向gewechat发起新的登录请求，如果你已经登录了gewechat不想退出登录可以自行构建一个ds.json文件。结构如下：(如未保存这些信息，建议直接手机退出登录后直接运行项目，将会唤起重新登录流程)

```json
{
    "token": "f4e4dd8d4ff148*************",
    "appid": "wx_*****************",
    "uuid": "************" 
}
```

- 由于使用了`better-sqlite3`作为数据缓存，内置的二进制文件对node版本有兼容依赖，建议使用node版本为20.17.0，可以使用[volta](https://volta.sh/)来管理node版本。
- 首次使用时需要缓存所有联系人和保存的群数据，如果联系人较多，可能会比较耗时，之后将会自动维护db缓存数据无需再次处理。


## 二、安装

使用以下命令安装本插件：

```bash
npm install --save gewechaty
```

## 三、使用方法

### 1. 导入插件

在你的 Node.js 项目中，使用以下方式导入插件：

```javascript
// 完整示例
const {
  GeweBot
} = require("gewechaty");

const bot = new GeweBot({
  debug: true, // 是否开启调试模式 默认false
  base_api: process.env.WEGE_BASE_API_URL, // Gewechat启动后的基础api地址base_api 默认为 `http://本机ip:2531/v2/api`
  file_api: process.env.WEGE_FILE_API_URL, // Gewechat启动后的文件api地址base_api 默认为 `http://本机ip:2532/download`,
});

// 监听消息事件
const onMessage = async (msg) => {
  // 处理消息...
  // 回复文本消息
  if (msg.type() === bot.Message.Type.Text) { //类型详见 MessageType 表
    await msg.say("Hello, World!");
  }
  // 处理图片消息
  if (msg.type() === bot.Message.Type.Image) {
    await msg.say("收到图片");
  }
};

bot.on("message", (msg) => {
  // 此处放回的msg为Message类型 可以使用Message类的方法
  onMessage(msg);
});

bot.on('friendship', (friendship) => { // 根据请求内容自动通过好友请求
  // type() 方法与wechaty不同 返回内容为场景值
  const scene = friendship.type() // 获取场景 3 ：微信号搜索  4 ：QQ好友  8 ：来自群聊  15：手机号
  if(friendship.hello() === 'ding' && scene === 15){ // 打招呼消息为ding 且是通过手机号添加的好友 则自动通过
    friendship.accept()
  }
})

bot.on('room-invite', async roomInvitation => { // 接受群邀请 
  try {
    await roomInvitation.accept()
  } catch (e) {
    console.error(e)
  }
})

bot.on('all', msg => { // 如需额外的处理逻辑可以监听 all 事件 该事件将返回回调地址接收到的所有原始数据
  console.log('received all event.')
})

// 扫码事件 如果需要获取二维码内容展示到其他地方的时候可以使用，一般不需要，已经在命令行中展示了需要扫码的二维码
bot.on('scan', qrcode => { // 需要用户扫码时返回对象qrcode.content为二维码内容 qrcode.url为转化好的图片地址
  console.log(qrcode.content)
})

bot
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
    const info = await bot.info() // 获取当前登录微信的个人信息
    console.log(info)

    const qrcode = await bot.qrcode() // 获取当前登录微信的二维码 base64
    console.log(qrcode)

    await bot.setInfo({ // 当前登录微信的设置个人信息
      "city": "Fuzhou", // 城市
      "country": "CN", // 国家
      "nickName": "test", //昵称
      "province": "Fujian", //省份
      "sex": 1, //性别 1:男 2:女
      "signature": "......" // 个性签名
    })

    // 设置隐私
    // 4:加我为朋友时需要验证  7:向我推荐通讯录朋友 8:添加我的方式 手机号 25:添加我的方式 微信号 38:添加我的方式 群聊 39:添加我的方式 我的二维码 40:添加我的方式 名片
    await bot.setPrivacy({
      option: 4, //
      open: true //开关
    })

    // 设置头像
    await bot.setAvatar('https://wx.qlogo.cn/mmhead/ver_1/REoLX7KfdibFAgDbtoeXGNjE6sGa8NCib8UaiazlekKjuLneCvicM4xQpuEbZWjjQooSicsKEbKdhqCOCpTHWtnBqdJicJ0I3CgZumwJ6SxR3ibuNs/0') // 设置头像

    const list = await bot.deviceList() // 获取设备记录
    console.log(list)


    // 通过手机号添加好友
    const contact = await bot.Friendship.search('150*******4')
    bot.Friendship.add(contact, 'ding')

    // 查找联系人方法
    const friend = await bot.Contact.find({name: 'test'}) // 使用昵称查询
    const friend2 = await bot.Contact.find({alias: 'test1'}) // 使用备注查询 
    const friend3 = await bot.Contact.find({id: 'wxid_xxxxx'}) // 直接使用wxid查询
    friend && friend.say('hello') // 给查询到的联系人发送消息

    // 创建群
    const room = await bot.Room.create([friend, friend2], '测试群22')
    room.say('hello')

    // 退出群
    const room = await bot.Room.find({topic: '测试群22'})
    room && room.quit()

    // 同步群信息到缓存 例如修改了群名称等
    const room = await bot.Room.find({topic: '测试群4'}) // 下载群头像
    const r = await room.sync() // 返回更新后的 Room 类

    // 获取群二维码
    const room = await bot.Room.find({topic: '测试群4'})
    const {qrBase64, qrTips} = await room.qrcode() // base64 
    console.log(qrBase64)

    const avatar = await room.avatar() // 获取群头像
    avatar.toFile('path/to/download/avatar.jpg') // 保存群头像到本地

    room.say('test', [friend, friend2]) // 通知指定成员

    room.say('test', '@all') // 通知全员


    // 监听群消息
    // 注意！！ 首次启动监听群消息的群需要保存该群到通讯录，否则无法在启动时获取群信息导致获取群信息失败，无法监听！！！
    const room = await bot.Room.find({topic: '测试群4'})
    if(room){
      room.on('join', async (room, contact) => {
        const urlLink = new UrlLink({
          title: `${contact._name}加入了群聊`,
          desc: `微信号：${contact._wxid}`,
          linkUrl: 'https://www.baidu.com'
        })
        room.say(urlLink)
      })
      room.on('leave', async (room, contact) => {
        const urlLink = new UrlLink({
          title: `${contact._name}退出了群聊`,
          desc: `微信号：${contact._wxid}`,
          linkUrl: 'https://www.baidu.com'
        })
        room.say(urlLink)
      })
      room.on('topic', (room, newTopic, oldTopic) => {
        room.say(`群名由“${oldTopic}”换成了“${newTopic}”`, '@all')
      })
    }


  })
  .catch((e) => {
    console.error(e);
  });
```

ES6 import 方式引用
```javascript
import pkg from 'gewechaty'
const {GeweBot, Filebox, UrlLink, WeVideo, Voice, MiniApp, AppMsg, Message} = pkg
const bot = new GeweBot({
  debug: true, // 是否开启调试模式 默认false
  base_api: process.env.WEGE_BASE_API_URL,
  file_api: process.env.WEGE_FILE_API_URL,
});
```

注意 登录成功后 appId uuid 和 token 将保存在当前项目根目录的 ds.json 文件中，如果项目迁移但是 Gewechat 没有退出登录的话需要将文件迁移过新项目根目录下。

### 2. Message 消息对象

基本支持 wechaty 的 Message 方法

```javascript
const {
  GeweBot,
  Filebox,
  UrlLink,
  WeVideo,
  Voice,
  MiniApp,
  AppMsg
} = require("gewechaty");


// 监听消息事件
const onMessage = async (msg) => {
  //直接调用msg.say()将会回复消息，个人消息和群消息一致
  // 发送文本消息
  msg.say("Hello, World!");

  // 发送图片或者文件
  const url = `${bot.proxy}/test/test.xlsx`;
  //此处需要使用https:// 或者http:// 开头的地址 可将地址放在本地静态目录下 这里将调用 `${process.cwd()}/${static}/test/test.xlsx` 这个文件
  msg.say(Filebox.fromUrl(url));
  // fromFile 需要传一个文件的绝对路径 只支持图片和文件，其他类型往下看文档
  msg.say(Filebox.fromFile(path-to-file));

  // 发送链接
  const urlLink = new UrlLink({
    title: "测试链接",
    desc: "测试链接",
    thumbUrl: `${bot.proxy}/test/avatar.jpg`,
    linkUrl: "https://www.baidu.com",
  });
  await msg.say(urlLink);

  // 发送名片 传入一个Contact类型的对象
  const friend = await msg.from();
  msg.say(friend);

  // 发送视频
  const video = new WeVideo({
    thumbUrl: `${bot.proxy}/test/avatar.jpg`, // 视频封面
    videoUrl: `${bot.proxy}/test/test2.mp4`, // 视频文件url
    videoDuration: 9, // 视频时长单位秒 似乎随便传个值就行
  });
  msg.say(video);

  // 发送语音 （由于确实silk文件暂时未发送成功 待测试）
  const voice = new Voice({
    voiceUrl: `${bot.proxy}/test/test2.silk`,
    voiceDuration: 3000, // 语音时长(注意 语音时长以毫秒为单位)
  });
  msg.say(voice);

  // 发送小程序消息
  const miniApp = new MiniApp({
    miniAppId: "wx1f9ea355b47256dd",
    userName: "gh_690acf47ea05@app",
    title: "最快29分钟 好吃水果送到家",
    coverImgUrl:
      "https://che-static.vzhimeng.com/img/2023/10/30/67d55942-e43c-4fdb-8396-506794ddbdbc.jpg",
    pagePath: "pages/homeDelivery/index.html",
    displayName: "百果园+",
  });
  msg.say(miniApp);

  // 发送app
  // 此处的appmsg为小程序消息的xml字符串 通过回调消息获取
  const appMsg = new AppMsg({
    appmsg: `<appmsg appid=\"\" sdkver=\"0\">\n\t\t<title>一审宣判！蔡鄂生被判死缓</title>\n\t\t<des />\n\t\t<action />\n\t\t<type>5</type>\n\t\t<showtype>0</showtype>\n\t\t<soundtype>0</soundtype>\n\t\t<mediatagname />\n\t\t<messageext />\n\t\t<messageaction />\n\t\t<content />\n\t\t<contentattr>0</contentattr>\n\t\t<url>http://mp.weixin.qq.com/s?__biz=MjM5MjAxNDM4MA==&amp;mid=2666774093&amp;idx=1&amp;sn=aa405094dd00034d004f6e8287f86e9b&amp;chksm=bcc9d903635a9c284591edda1f027c467245d922d7d66c32d3cd2c6af1c969a7ea0896aa7639&amp;scene=0&amp;xtrack=1#rd</url>\n\t\t<lowurl />\n\t\t<dataurl />\n\t\t<lowdataurl />\n\t\t<appattach>\n\t\t\t<totallen>0</totallen>\n\t\t\t<attachid />\n\t\t\t<emoticonmd5 />\n\t\t\t<fileext />\n\t\t\t<cdnthumburl>3057020100044b304902010002048399cc8402032f57ed02041388e6720204658e922d042462666538346165322d303035382d343262322d616538322d3337306231346630323534360204051408030201000405004c53d900</cdnthumburl>\n\t\t\t<cdnthumbmd5>ea3d5e8d4059cb4db0a3c39c789f2d6f</cdnthumbmd5>\n\t\t\t<cdnthumblength>93065</cdnthumblength>\n\t\t\t<cdnthumbwidth>1080</cdnthumbwidth>\n\t\t\t<cdnthumbheight>459</cdnthumbheight>\n\t\t\t<cdnthumbaeskey>849df42ab37c8cadb324fe94ba46d76e</cdnthumbaeskey>\n\t\t\t<aeskey>849df42ab37c8cadb324fe94ba46d76e</aeskey>\n\t\t\t<encryver>0</encryver>\n\t\t</appattach>\n\t\t<extinfo />\n\t\t<sourceusername>gh_363b924965e9</sourceusername>\n\t\t<sourcedisplayname>人民日报</sourcedisplayname>\n\t\t<thumburl>https://mmbiz.qpic.cn/sz_mmbiz_jpg/xrFYciaHL08DCJtwQefqrH8JcohbOHhTpyCPab8IgDibkTv3Pspicjw8TRHnoic2tmiafBtUHg7ObZznpWocwkCib6Tw/640?wxtype=jpeg&amp;wxfrom=0</thumburl>\n\t\t<md5 />\n\t\t<statextstr />\n\t\t<mmreadershare>\n\t\t\t<itemshowtype>0</itemshowtype>\n\t\t</mmreadershare>\n\t</appmsg>`,
  });
  msg.say(appMsg);

  // 发送表情包
  // 此处的emojiMd5为emoji消息的md5字符串 通过回调消息获取
  const emoji = new Emoji({
      emojiMd5: '6fde3fed2add8451338f3fdd67983b7d',
      emojiSize: 17799
  });
  msg.say(emoji);

  msg.quote('引用了这条消息') // 引用这条消息传入一个引用时的内容只能是文字

  // 下载图片 如果为图片消息可以使用toFileBox方法下载
  const filebox = await msg.toFileBox();
  // 传入一个文件路径 推荐为静态托管目录 如：`${process.cwd()}/static/download` 这样后续需要发送图片时可以直接使用静态托管的http路径
  const fileurl = path.join(staticUrl, filebox.name);
  filebox.toFile(fileurl);

  // 消息撤回
  const myMsg = await msg.say(filebox);
  setTimeout(() => {
    myMsg.revoke();
  }, 1000);
};

bot.on("message", (msg) => {
  // 此处放回的msg为Message类型 可以使用Message类的方法
  onMessage(msg);
});
bot.start()
```

注意：此处所有发送的文件fromUrl时url必须为`http(s)://` 开头的地址，可将文件放在静态托管目录下，即可使用`http://ip:port/xxx/xxx.png`的方式传输。静态托管目录如为 `/static`,文件地址为`/static/images/test.jpg` 则在线访问地址为`http://localhost:port/images/test.jpg` 此时`bot.proxy`为`http://ip:port`或自己设置的代理地址

## 四、配置选项

如果插件有可配置的选项，可以在此部分进行说明，例如：

```javascript
const bot = new GeweBot({
  debug: true, // 是否开启调试模式 默认false 开启调试将在控制台输出回调接口接收到的内容
  port: 3000, // 本地服务端口 默认3000
  proxy: process.env.WEGE_LOCAL_PROXY, // 本地代理地址，用于gewechat的docker在云时无法访问本地时使用 可为空 如果有则使用代理 否则使用本机ip地址例如 （http://proxy.domain.com:3000）注意需要跟上端口号
  static: "static", // 本机静态托管的目录 用于文件下载和上传 默认为static
  route: "/getWechatCallBack", // 本地回调接口route 默认为 `/getWechatCallBack` 最终地址为 `http://本机ip:port/getWechatCallBack`
  base_api: process.env.WEGE_BASE_API_URL, // 基础api地址base_api 默认为 `http://本机ip:2531/v2/api`
  file_api: process.env.WEGE_FILE_API_URL, // 文件api地址base_api 默认为 `http://本机ip:2532/download`,
});
// 如果docker 和GeweBot在同一台电脑上 可以直接使用 new GeweBot() 即可
```

### GeweBot 类方法介绍

| **方法名**                | **返回值类型** | **描述**                                                 |
|---------------------------|----------------|--------------------------------------------------------|
| `start()`                 | `Promise`      | 启动服务                                                 |
| `on(eventName, callback)` | `void`         | 监听指定事件，`eventName` 为事件名，`callback` 为回调函数。 |
| `logout()`                | `boolean`      | 退出登录                                                 |
| `info()`                  | `Promise`      | 获取当前登录用户的个人信息。                              |
| `qrcode()`                | `Promise`      | 获取当前用户的二维码。                                    |
| `getAppId()`              | `string`       | 获取 `appId`。                                            |
| `getToken()`              | `string`       | 获取 `token`。                                            |
| `getUuid()`               | `string`       | 获取 `uuid`。                                             |
| `setInfo(info)`           | `void`         | 设置用户的个人信息，`info` 为用户信息对象。                |
| `setPrivacy(privacy)`     | `void`         | 设置隐私信息，`privacy` 为隐私设置对象。                   |
| `setAvatar(avatar)`       | `void`         | 设置用户的头像，`avatar` 为头像图片的路径或 URL。          |
| `deviceList()`            | `Promise`      | 获取用户设备列表。                                        |



### Message 类方法表

| **方法名**                            | **返回值类型**         | **说明**                                              |
|---------------------------------------|------------------------|-----------------------------------------------------|
| `isCompanyMsg()`                      | `boolean`              | 判断消息是否为企业微信消息。                           |
| `from()`                              | `Promise<Contact>`     | 获取消息的发送者。                                     |
| `to()`                                | `Promise<Contact>`     | 获取消息的接收者。                                     |
| `room()`                              | `Promise<Room>`        | 获取群信息。                                           |
| `text()`                              | `string`               | 获取消息的内容。                                       |
| `async say(textOrContactOrFileOrUrl)` | `Promise<ResponseMsg>` | 回复消息。                                             |
| `type()`                              | `string`               | 获取消息的类型。参考 MessageType                       |
| `self()`                              | `boolean`              | 判断是否为自己发的消息。                               |
| `async mentionSelf()`                 | `Promise`              | 判断是否自己被@。                                      |
| `async forward(Contact)`              | `Promise`              | 转发消息。                                             |
| `async quote(text)`                   | `Promise`              | 引用消息（传入一个字符串）。                             |
| `date()`                              | `Date`                 | 获取消息的日期。                                       |
| `age()`                               | `number`               | 获取消息的年龄（以秒为单位）。                           |
| `async toFileBox(type = 2)`           | `Promise<FileBox>`     | 将消息转换为 FileBox 对象，用于图片消息type为图片质量。 |
| `getXml2Json(xml)`                    | `Object`               | 将 XML 解析为 JSON 对象。                              |
| `static async find(query)`            | `Promise<Contact>`     | (由于未保存聊天信息，暂不支持)                         |
| `static async findAll(queryArgs)`     | `Promise<[Contact]>`   | （由于未保存聊天信息，暂不支持 ）                        |


### ResponseMsg 类属性和方法表

| **方法名** | **返回值类型** | **说明**  |
|------------|----------------|---------|
| `revoke()` | `Promise`      | 撤回消息。 |

### Contact 类方法表

| **方法名**                            | **返回值类型** | **说明**                                                                        |
|---------------------------------------|----------------|-------------------------------------------------------------------------------|
| `async say(textOrContactOrFileOrUrl)` | `Promise`      | 回复消息，返回 `ResponseMsg` 对象，可用于撤回消息。                                |
| `name()`                              | `string`       | 获取联系人的昵称。                                                               |
| `async alias(newAlias)`               | `Promise`      | 获取或设置联系人的备注名。传递 `newAlias` 时设置新的备注名，否则返回当前的备注名。 |
| `friend()`                            | `boolean`      | 返回是否为微信好友。当前固定为 tue                                               |
| `type()`                              | `number`       | 返回联系人的类型。                                                               |
| `gender()`                            | `number`       | 返回联系人的性别。                                                               |
| `province()`                          | `string`       | 返回联系人的省份信息。                                                           |
| `city()`                              | `string`       | 返回联系人的城市信息。                                                           |
| `async avatar()`                      | `Promise`      | 返回联系人的头像 URL。                                                           |
| `async sync()`                        | `Promise`      | 同步联系人信息，同步后会自动更新本地缓存。                                      |
| `self()`                              | `boolean`      | 判断该联系人是否为当前用户自己。                                                 |

### Contact 类静态方法表

| **方法名**                 | **返回值类型**     | **说明**                                             |
|----------------------------|--------------------|----------------------------------------------------|
| `static async find(query)` | `Promise<Contact>` | 根据查询条件查找联系人。（query 为 wxid 或 Contact 类） |
| `static async findAll()`   | `Promise`          | 查找通讯录列表返回所有好友 wxid 列表                 |

### Room 类方法说明

| **方法名**                              | **返回值类型**         | **说明**                     |
|-----------------------------------------|------------------------|----------------------------|
| `async sync()`                          | `Promise`              | 同步房间信息                 |
| `async say(textOrContactOrFileOrUrl)`   | `Promise<ResponseMsg>` | 发送消息到房间               |
| `async add(contact)`                    | `Promise`              | 添加成员到房间               |
| `async del(contact)`                    | `Promise`              | 删除房间成员                 |
| `async quit()`                          | `Promise`              | 退出房间                     |
| `async topic(string)`                   | `Promise<string>`      | 修改房间话题，或获取当前话题  |
| `async announce(string)`                | `Promise`              | 获取或设置房间公告           |
| `async qrcode()`                        | `Promise`              | 获取房间的二维码             |
| `async alias(contact)`                  | `Promise<string>`      | 获取成员别名                 |
| `async has(contact)`                    | `Promise<boolean>`     | 检查房间是否有某个成员       |
| `async memberAll(string)`               | `Promise<[Contact]>`   | 获取所有成员或符合查询的成员 |
| `async member(string)`                  | `Promise<Contact>`     | 获取单个成员                 |
| `async owner()`                         | `Promise<Contact>`     | 获取房间的拥有者             |
| `async avatar()`                        | `Promise<FileBox>`     | 获取房间头像                 |
| `async create([contact], roomName)`     | `Promise`              | 创建新房间                   |
| `async findAll({name: 'name'} or null)` | `Promise<[Room]>`      | 查询符合条件的房间           |
| `async find({name: 'name'})`            | `Promise<Room>`        | 查询单个符合条件的房间       |


### Filebox 类方法说明

| **方法名**                           | **返回值类型**  | **说明**                         |
|--------------------------------------|-----------------|--------------------------------|
| `static fromUrl(url)`                | `Filebox`       | 从 URL 创建一个 Filebox 实例     |
| `static fromFile(filepath)`          | `Filebox`       | 从文件路径创建实例               |
| `static toDownload(url, type, name)` | `Filebox`       | 从 URL 创建可下载的 Filebox 实例 |
| `toFile(dest)`                       | `Promise<void>` | 将实例文件下载到指定路径         |
| `static getFileType(fileName)`       | `string`        | 根据文件名返回文件类型           |


### MessageType 类型表

| **类型**         | **说明**     |
|------------------|------------|
| `Unknown`        | 未知类型     |
| `FileStart`      | 文件开始     |
| `File`           | 文件发送结束 |
| `Voice`          | 语音         |
| `Contact`        | 名片         |
| `Emoji`          | 表情         |
| `Image`          | 图片         |
| `Text`           | 文本         |
| `Video`          | 视频         |
| `Url`            | 链接         |
| `RoomInvitation` | 群邀请       |
| `MiniApp`        | 小程序消息   |
| `AppMsg`         | app 消息     |
| `Link`           | 公众号链接   |
| `AddFriend`      | 添加好友通知 |
| `Quote`          | 引用消息     |
| `Transfer`       | 转账         |
| `RedPacket`      | 红包         |
| `VideoAccount`   | 视频号消息   |
| `Revoke`         | 撤回消息     |
| `Pat`            | 拍一拍       |
| `Location`       | 位置消息     |

### Friendship 类方法表

| **方法名**                                | **返回值类型**        | **说明**                                     |
|-------------------------------------------|-----------------------|--------------------------------------------|
| `accept()`                                | `Promise`             | 接受好友请求。                                |
| `reject(content)`                         | `Promise`             | 拒绝好友请求。                                |
| `hello()`                                 | `string`              | 获取好友请求的内容。                          |
| `contact()`                               | `Contact`             | 获取好友的联系人信息。                        |
| `type()`                                  | `number`              | 获取好友请求的来源类型（如微信号搜索、群聊等）。 |
| `static async search(mobile)`             | `Promise<Friendship>` | 根据手机号搜索联系人。                        |
| `static async add(contact, helloMessage)` | `Promise`             | 添加联系人，发送好友请求。                     |


### RoomInvitation 类方法表

| **方法名**  | **返回值类型**     | **说明**                            |
|-------------|--------------------|-----------------------------------|
| `accept()`  | `Promise<void>`    | 接受房间邀请。                       |
| `inviter()` | `Promise<Contact>` | 获取邀请人，返回一个 `Contact` 对象。 |
| `topic()`   | `Promise<string>`  | 获取房间邀请的主题。                 |
| `date()`    | `Promise<Date>`    | 获取房间邀请的日期和时间。           |
| `age()`     | `Promise<number>`  | 获取邀请的年龄（以秒为单位）。         |


免责声明【必读】

- 本框架仅供学习和技术研究使用，不得用于任何商业或非法行为，否则后果自负。

- 本框架的作者不对本工具的安全性、完整性、可靠性、有效性、正确性或适用性做任何明示或暗示的保证，也不对本工具的使用或滥用造成的任何直接或间接的损失、责任、索赔、要求或诉讼承担任何责任。

- 本框架的作者保留随时修改、更新、删除或终止本工具的权利，无需事先通知或承担任何义务。

- 本框架的使用者应遵守相关法律法规，尊重微信的版权和隐私，不得侵犯微信或其他第三方的合法权益，不得从事任何违法或不道德的行为。

- 本框架的使用者在下载、安装、运行或使用本工具时，即表示已阅读并同意本免责声明。如有异议，请立即停止使用本工具，并删除所有相关文件。



## 五、贡献

如果你想为这个插件做出贡献，可以按照以下步骤进行：

1. Fork 本仓库。
2. 创建一个新的分支进行你的修改。
3. 提交你的修改并创建一个 pull request。

## License

This project is licensed under the MIT License - see the [MIT License](./LICENSE) file for details.

---
