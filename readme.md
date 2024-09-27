# gewechaty

## 一、简介

gewechaty 是基于[Gewechat](https://github.com/Devo919/Gewechat?tab=readme-ov-file)项目的二次封装，提供了更方便的使用方式。参考 wechaty 的 api 实现，以满足更快速开发的需求（由于gewechat接口限制无法平滑迁移只是提供更便捷的使用方法）。

本项目基于 Gewechat，请先确认 Gewechat 已经能够正常启动，否则无法使用本插件。

更多功能尚在开发（以下为已实现功能，更新后 api 可能会修改，谨慎使用）

## 二、安装

使用以下命令安装本插件：

```bash
npm install --save gewechaty
```

## 三、使用方法

### 1. 导入插件

在你的 Node.js 项目中，使用以下方式导入插件：

```javascript
const {
  GeweBot,
  Filebox,
  UrlLink,
  WeVideo,
  Voice,
  MiniApp,
  AppMsg,
  Message,
} = require("gewechaty");
const bot = new GeweBot({
  base_api: process.env.WEGE_BASE_API_URL, // Gewechat启动后的基础api地址base_api 默认为 `http://本机ip:2531/v2/api`
  file_api: process.env.WEGE_FILE_API_URL, // Gewechat启动后的文件api地址base_api 默认为 `http://本机ip:2532/download`,
});

// 监听消息事件
const onMessage = async (msg) => {
  // 处理消息...
  // 回复文本消息
  if (msg.type === Message.MessageType.Text) {
    await msg.say("Hello, World!");
  }
  // 处理图片消息
  if (msg.type === Message.MessageType.Image) {
    await msg.say("收到图片");
  }
};

bot.on("message", (msg) => {
  // 此处放回的msg为Message类型 可以使用Message类的方法
  onMessage(msg);
});
bot
  .start()
  .then(async () => {
    // 启动成功
  })
  .catch((e) => {
    console.error(e);
  });
```

注意 登录成功后 appId uuid 和 token 将保存在当前项目根目录的 ds.json 文件中，如果项目迁移但是 Gewechat 没有退出登录的话需要将文件迁移过新项目根目录下。

### 2. Message 消息对象

基本支持 wechaty 的 Message 方法

```javascript
//直接调用msg.say()将会回复消息，个人消息和群消息一支
// 发送文本消息
msg.say("Hello, World!");

// 发送图片或者文件
const url = `${bot.proxy}/test/test.xlsx`;
//此处需要使用https:// 或者http:// 开头的地址 可将地址放在本地静态目录下 这里将调用 `${process.cwd()}/static/test/test.xlsx` 这个文件
msg.say(Filebox.fromUrl(url));

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
  videoDuration: 9, // 视频时长 似乎随便传个值就行
});
msg.say(video);

// 发送语音 （由于确实silk文件暂时未发送成功 待测试）
const voice = new Voice({
  voiceUrl: `${bot.proxy}/test/test2.silk`,
  voiceDuration: 9, // 语音时长
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

// 下载图片 如果为图片消息可以使用toFileBox方法下载
const filebox = await msg.toFileBox();
// 传入一个文件路径 推荐为静态托管目录 如：`${process.cwd()}/static/download` 这样后续需要发送图片时可以直接使用静态托管的http路径
const fileurl = path.join(staticUrl, filebox.name);
filebox.toFile(fileurl);

// 消息撤回 所有消息均支持撤回
const myMsg = await msg.say(filebox);
setTimeout(() => {
  myMsg.revork();
}, 1000);
```

注意：此处所有涉及到发送的文件 url 的都必须为`http://` 开头的地址，可将文件放在静态托管目录下，即可使用`http://ip:port/xxx/xxx.png`的方式传输

## 四、配置选项

如果插件有可配置的选项，可以在此部分进行说明，例如：

```javascript
const bot = new GeweBot({
  port: 3000, // 本地服务端口 默认3000
  proxy: process.env.WEGE_LOCAL_PROXY, // 本地代理地址用于docker在云时无法访问本地时使用 可为空 如果有则使用代理 否则使用本机ip地址
  static: "static", // 本机静态托管的目录 用于文件下载和上传 默认为static
  route: "/getWechatCallBack", // 本地回调接口route 默认为 `/getWechatCallBack` 最终地址为 `http://本机ip:port/getWechatCallBack`
  base_api: process.env.WEGE_BASE_API_URL, // 基础api地址base_api 默认为 `http://本机ip:2531/v2/api`
  file_api: process.env.WEGE_FILE_API_URL, // 文件api地址base_api 默认为 `http://本机ip:2532/download`,
});
// 如果docker 和GeweBot在同一台电脑上 可以直接使用 new GeweBot() 即可
```

### Message 类方法表

| **方法名**                            | **返回值类型**         | **说明**                                    |
|---------------------------------------|------------------------|-------------------------------------------|
| `isCompanyMsg()`                      | `boolean`              | 判断消息是否为企业微信消息。                 |
| `from()`                              | `Promise<Contact>`     | 获取消息的发送者。                           |
| `to()`                                | `Promise<Contact>`     | 获取消息的接收者。                           |
| `room()`                              | `boolean`              | 判断消息是否为群聊消息。                     |
| `text()`                              | `string`               | 获取消息的内容。                             |
| `async say(textOrContactOrFileOrUrl)` | `Promise<ResponseMsg>` | 回复消息。                                   |
| `type()`                              | `string`               | 获取消息的类型。参考 MessageType             |
| `self()`                              | `boolean`              | 判断是否为自己发的消息。                     |
| `async mention()`                     | `Promise`              | 获取被@的联系人（尚未实现）。                  |
| `async mentionSelf()`                 | `Promise`              | 判断是否自己被@。                            |
| `async forward(to)`                   | `Promise`              | 转发消息。                                   |
| `date()`                              | `Date`                 | 获取消息的日期。                             |
| `age()`                               | `number`               | 获取消息的年龄（以秒为单位）。                 |
| `async toContact()`                   | `Promise`              | 获取名片（尚未实现）。                         |
| `async toUrlLink()`                   | `Promise`              | 获取链接（尚未实现）。                         |
| `async toFileBox(type = 2)`           | `Promise<FileBox>`     | 将消息转换为 FileBox 对象，通常用于图片消息。 |
| `getXml2Json(xml)`                    | `Object`               | 将 XML 解析为 JSON 对象。                    |
| `static async find(query)`            | `Promise<Contact>`     | 根据查询条件查找消息。                       |
| `static async findAll(queryArgs)`     | `Promise<[Contact]>`   | 查找所有符合查询条件的消息（暂不支持）。       |


### ResponseMsg 类属性和方法表

| **方法名** | **返回值类型** | **说明**  |
|------------|----------------|---------|
| `revork()` | `Promise`      | 撤回消息。 |

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
| `async sync()`                        | `Promise`      | 同步联系人信息，当前未支持，直接返回 `true`。                                      |
| `self()`                              | `boolean`      | 判断该联系人是否为当前用户自己。                                                 |

### Contact 类静态方法表

| **方法名**                 | **返回值类型**     | **说明**                                             |
|----------------------------|--------------------|----------------------------------------------------|
| `static async find(query)` | `Promise<Contact>` | 根据查询条件查找联系人。（query 为 wxid 或 Contact 类） |
| `static async findAll()`   | `Promise`          | 查找通讯录列表返回所有好友 wxid 列表                 |

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
| `Revork`         | 撤回消息     |
| `Pat`            | 拍一拍       |
| `Location`       | 位置消息     |

## 五、贡献

如果你想为这个插件做出贡献，可以按照以下步骤进行：

1. Fork 本仓库。
2. 创建一个新的分支进行你的修改。
3. 提交你的修改并创建一个 pull request。

## License

This project is licensed under the MIT License - see the [MIT License](./LICENSE) file for details.

---
