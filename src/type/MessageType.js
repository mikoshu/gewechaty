export const MessageType = {
  Unknown: 'unknown', // 未知类型
  FileStart: 'file_start', // 文件开始
  File: 'file', // 文件发送结束
  Voice: 'voice', // 语音
  Contact: 'contact', // 名片
  Emoji: 'emoji', // 表情
  Image: 'image', // 图片
  Text: 'text', // 文本
  Video: 'video', // 视频
  Url: 'link', // 链接
  RoomInvitation: 'room_invitation', // 群邀请
  MiniApp:'mini_app', // 小程序消息
  AppMsg: 'app_msg', // app消息
  Link: 'link', // 公众号链接
  AddFriend: 'add_friend', // 添加好友通知
  Quote: 'quote', // 引用消息
  Transfer: 'transfer', //转账
  RedPacket: 'red_packet', //红包
  VideoAccount: 'video_account', // 视频号消息
  Revork: 'revork', // 撤回消息
  Pat:'pat', // 拍一拍
  Location: 'location', // 位置消息
};