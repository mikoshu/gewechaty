import { type MyDB, type RoomMemberInDB } from './src/sql/index.d';
import type * as Koa from 'koa';
import type * as Router from 'koa-router';

declare module 'gewechaty' {
    export class GeweBot {
      constructor(options?: GeweBotOptions);
      db: MyDB; // SQLite database instance
      use_cache: boolean;
      start(): Promise<{
          app: Koa;
          router: Router;
      }>;
      on(event: 'message', listener: (msg: Message) => void): void;
      on(event: 'friendship', listener: (friendship: Friendship) => void): void;
      on(event: 'room-invite', listener: (roomInvitation: RoomInvitation) => void): void;
      on(event: 'all', listener: (payload: any) => void): void;
      on(event: 'scan', listener: (qrcode: QRCode) => void): void;
      login(): Promise<boolean>;
      logout(): Promise<boolean>;
      info(): Promise<ContactSelf>;
      qrcode(): Promise<string>;
      getAppId(): string;
      getToken(): string;
      getUuid(): string;
      setInfo(options: ContactSettings): Promise<void>;
      setPrivacy(options: PrivacySettings): Promise<void>;
      setAvatar(fileUrl: string): Promise<void>;
      deviceList(): Promise<Device[]>;
      refreshContactCache(): Promise<void>;
      Contact: ContactStatic;
      Friendship: FriendshipStatic;
      Room: RoomStatic;
      Message: MessageStatic;
    }
  
    export interface GeweBotOptions {
      debug?: boolean;
      base_api: string;
      file_api: string;
      ip?: string;
      port?: number;
      proxy?: string;
      static?: string;
      route?: string;
      use_cache?: boolean;
      data_dir?: string;
    }
  
    export interface ContactSelf {
      city: string;
      country: string;
      nickName: string;
      province: string;
      sex: number;
      signature: string;
      wxid: string;
      name: string;
      alias: string;
    }
  
    export interface ContactSettings {
      city?: string;
      country?: string;
      nickName?: string;
      province?: string;
      sex?: number;
      signature?: string;
    }
  
    export interface PrivacySettings {
      option: number;
      open: boolean;
    }
  
    export interface Device {
      client_id: string;
      device_name: string;
      device_type: string;
      login_time: number;
    }
  
    export interface QRCode {
      content: string;
      url: string;
    }
  
    export class Contact {
      // Properties from CONTACT.js constructor
      /** @deprecated 不建议直接访问私有变量，可使用 `name()` 方法替代 */
      _name: string;
      /** @deprecated 不建议直接访问私有变量，可使用 `alias()` 方法替代 */
      _alias: string;
      /** @deprecated 不建议直接访问私有变量，可使用 `friend()` 方法替代 */
      _isFriend: boolean;
      /** @deprecated 不建议直接访问私有变量，可使用 `wxid()` 方法替代 */
      _wxid: string | null;
      /** @deprecated 不建议直接访问私有变量，可使用 `type()` 方法替代 */
      _type: number;
      /** @deprecated 不建议直接访问私有变量，可使用 `gender()` 方法替代 */
      _gender: number;
      /** @deprecated 不建议直接访问私有变量，可使用 `province()` 方法替代 */
      _province: string | null;
      /** @deprecated 不建议直接访问私有变量，可使用 `city()` 方法替代 */
      _city: string | null;
      /** @deprecated 不建议直接访问私有变量，可使用 `avatar()` 方法替代 */
      _avatarUrl: string;
      /** @deprecated 不建议直接访问私有变量，可使用 `self()` 方法替代 */
      _isSelf: boolean;
      inviterUserName: string;
      
      // Methods from CONTACT.js
      say(textOrContactOrFileOrUrl: string | Contact | Filebox | UrlLink | MiniApp): Promise<ResponseMsg>;
      name(): string;
      wxid(): string | null;
      alias(newAlias?: string): Promise<string | void>;
      friend(): boolean;
      type(): number;
      gender(): number;
      province(): string | null;
      city(): string | null;
      avatar(): Promise<string>;
      sync(): Promise<Contact>;
      self(): boolean;
  
      // Static methods
      /**
       * 根据名称、别名或微信 ID 精确查询单个联系人
       * @param {string|Object} query - 查询条件，可以是字符串或查询对象：
       *   - 若为字符串，将按微信 ID 精确查询
       *   - 若为对象，需包含以下属性之一：
       *     @property {string} [name] - 联系人名称（精确匹配）
       *     @property {string} [alias] - 联系人备注名（精确匹配）
       *     @property {string} [wxid] - 联系人微信 ID（精确匹配）
       * @returns {Promise<Contact|null>} 返回 Promise，解析为匹配的联系人对象，未找到返回 null
       * @throws {Error} 当参数格式不符合要求或未提供有效查询条件时抛出
       */
      static find(query: string | ContactQueryFilter): Promise<Contact | null>;
      /**
       * 批量查询联系人，支持模糊匹配或获取全部
       * @param {Object} [query] - 可选查询条件对象：
       *   - 不传参数时返回所有联系人
       *   - 若传对象，需包含以下属性之一：
       *     @property {string} [name] - 联系人名称（模糊匹配）
       *     @property {string} [alias] - 联系人备注名（模糊匹配）
       * @returns {Promise<Contact[]>} 返回 Promise，解析为联系人数组，无匹配条目时返回空数组
       * @throws {Error} 当参数格式不符合要求或查询条件不合法时抛出
       */
      static findAll(query?: ContactQueryAllFilter): Promise<Contact[]>;
    }
  
    export interface ContactStatic {
      // Static methods
      /**
       * 根据名称、别名或微信 ID 精确查询单个联系人
       * @param {string|Object} query - 查询条件，可以是字符串或查询对象：
       *   - 若为字符串，将按微信 ID 精确查询
       *   - 若为对象，需包含以下属性之一：
       *     @property {string} [name] - 联系人名称（精确匹配）
       *     @property {string} [alias] - 联系人备注名（精确匹配）
       *     @property {string} [wxid] - 联系人微信 ID（精确匹配）
       * @returns {Promise<Contact|null>} 返回 Promise，解析为匹配的联系人对象，未找到返回 null
       * @throws {Error} 当参数格式不符合要求或未提供有效查询条件时抛出
       */
      find(query: string | ContactQueryFilter): Promise<Contact | null>;
      /**
       * 批量查询联系人，支持模糊匹配或获取全部
       * @param {Object} [query] - 可选查询条件对象：
       *   - 不传参数时返回所有联系人
       *   - 若传对象，需包含以下属性之一：
       *     @property {string} [name] - 联系人名称（模糊匹配）
       *     @property {string} [alias] - 联系人备注名（模糊匹配）
       * @returns {Promise<Contact[]>} 返回 Promise，解析为联系人数组，无匹配条目时返回空数组
       * @throws {Error} 当参数格式不符合要求或查询条件不合法时抛出
       */
      findAll(query?: ContactQueryAllFilter): Promise<Contact[]>;
    }
  
    export interface ContactQueryFilter {
      name?: string;
      alias?: string;
      wxid?: string;
    }

    export interface ContactQueryAllFilter {
      name?: string;
      alias?: string;
    }
  
    export class Friendship {
      accept(): Promise<void>;
      reject(content: string): Promise<void>;
      hello(): string;
      contact(): Contact;
      type(): number;

      static search(query: string): Promise<Contact | undefined>;
      static add(contact: Contact, hello: string): Promise<void>;
    }
  
    export interface FriendshipStatic {
      search(query: string): Promise<Contact | undefined>;
      add(contact: Contact, hello: string): Promise<void>;
    }
  
    export class RoomInvitation {
      accept(): Promise<void>;
    }
  
    export class Room {
      // Properties from ROOM.js constructor
      chatroomId: string;
      name: string;
      remark: string;
      chatRoomNotify: any;
      chatRoomOwner: string;
      isNotify: boolean;
      OwnerId: string;
      avatarImg: string;
      memberList: RoomMemberInDB;
  
      // Methods from ROOM.js
      sync(): Promise<Room>;
      say(textOrContactOrFileOrUrl: string | Contact | Filebox | UrlLink | MiniApp, ats?: Contact[] | '@all'): Promise<ResponseMsg>;
      on(event: 'join', listener: (room: Room, invitee: Contact, inviter: Contact) => void): void;
      on(event: 'leave', listener: (room: Room, leaver: Contact, remover?: Contact) => void): void;
      on(event: 'topic', listener: (room: Room, newTopic: string, oldTopic: string, changer: Contact) => void): void;
      add(contact: Contact | string, reason?: string): Promise<void>;
      del(contact: Contact | string): Promise<void>;
      quit(): Promise<void>;
      topic(newTopic?: string): Promise<string>;
      announce(text?: string): Promise<string>;
      qrcode(): Promise<{ qrBase64: string, qrTips: string }>;
      alias(contact: Contact): Promise<string | null>;
      has(contact: Contact): Promise<boolean>;
      memberAll(query?: string): Promise<Contact[]>;
      member(query: string): Promise<Contact | null>;
      owner(): Promise<Contact>;
      avatar(): Promise<Filebox>;
      rename(name?: string): Promise<string>;
  
      // Static methods
      static create(contactList: Contact[], topic?: string): Promise<Room>;
      static findAll(query?: RoomQueryFilter): Promise<Room[]>;
      static find(query: RoomQueryFilter): Promise<Room | undefined>;
    }
  
    export interface RoomStatic {
      create(contactList: Contact[], topic?: string): Promise<Room>;
      find(query: RoomQueryFilter): Promise<Room | undefined>;
      findAll(query?: RoomQueryFilter): Promise<Room[]>;
    }
  
    export interface RoomQueryFilter {
      topic?: string;
    }
  
    export class Message {
      // Properties from MESSAGE.js constructor
      wxid: string;
      fromId: string;
      toId: string;
      isRoom: boolean;
      roomId: string;
      _text: string;
      _msgId: string | null;
      _newMsgId: string | null;
      _type: number;
      _createTime: number;
      _date: number;
      _self: boolean;
      _pushContent: string;
      _msgSeq: string | null;
      _status: any | null;
      _msgSource: string | null;
      _roomInfo?: any;
  
      // Methods from MESSAGE.js
      isCompanyMsg(): boolean;
      from(): Promise<Contact>;
      talker(): Promise<Contact>;
      to(): Promise<Contact>;
      room(): Promise<Room | false>;
      text(): string;
      say(textOrContactOrFileOrUrl: string | Contact | Filebox | UrlLink | MiniApp | AppMsg | Voice | WeVideo | Emoji): Promise<ResponseMsg>;
      type(): MessageType;
      self(): boolean;
      mention(): Promise<null>; // TODO as noted in the code
      mentionSelf(): Promise<boolean>;
      forward(to: Contact): Promise<void>;
      date(): Date;
      age(): number;
      toContact(): Promise<null>; // TODO as noted in the code
      toUrlLink(): Promise<null>; // TODO as noted in the code
      toFileBox(type?: number): Promise<Filebox | null>;
      quote(title: string): Promise<void>;

  
      // Static methods
      static getXmlToJson(xml: string): any;
      static find(query: any): Promise<Message>;
      static findAll(queryArgs: any): Promise<Message[]>;
      static getType(type: number, xml: string): number;
      static revoke(obj: any): Promise<void>;
    }
  
    export interface MessageStatic {
      Type: {
        Unknown: 'unknown',
        FileStart: 'file_start',
        File: 'file',
        Voice: 'voice',
        Contact: 'contact',
        Emoji: 'emoji',
        Image: 'image',
        Text: 'text',
        Video: 'video',
        Url: 'link',
        RoomInvitation: 'room_invitation', 
        MiniApp:'mini_app',
        AppMsg: 'app_msg',
        Link: 'link',
        AddFriend: 'add_friend',
        Quote: 'quote',
        Transfer: 'transfer',
        RedPacket: 'red_packet',
        VideoAccount: 'video_account',
        Revoke: 'revoke',
        Pat:'pat',
        Location: 'location',
        FunctionMsg: 'function_msg',
        NewMonmentTimeline: 'new_monment_timeline',
        ChatHistroy: 'chat_histroy',
        RoomVoip: 'room_voip',
        Voip: 'voip',
        VoipHangup: 'voip_hangup',
        RealTimeLocation: 'real_time_location',
      };
    }
  
    export class WeVideo {
      constructor(payload: WeVideoPayload);
    }
  
    export interface WeVideoPayload {
      thumbUrl: string;      // 视频封面
      videoUrl: string;      // 视频文件url
      videoDuration: number; // 视频时长单位秒
    }
  
    export class Voice {
      constructor(payload: VoicePayload);
    }
  
    export interface VoicePayload {
      voiceUrl: string;       // 语音文件url
      voiceDuration: number;  // 语音时长(毫秒)
    }
  
    export class Filebox {
      // Properties from FILEBOX.js
      url: string;
      type: string;
      name: string;
  
      // Static methods from FILEBOX.js
      static fromUrl(url: string, forceType?: string): Filebox;
      static fromFile(filepath: string, time?: number): Filebox;
      static toDownload(url: string, type?: string, name?: string): Filebox;
      static getFileType(fileName: string): 'image' | 'video' | 'audio' | 'file' | 'unknown';
  
      // Instance methods from FILEBOX.js
      toFile(dest: string): Promise<void>;
    }
  
    export class UrlLink {
      constructor(payload: UrlLinkPayload);
    }
  
    export interface UrlLinkPayload {
      title: string;
      desc?: string;
      linkUrl: string;
      thumbUrl: string;
    }
  
    export class MiniApp {
      constructor(payload: MiniAppPayload);
    }
  
    export interface MiniAppPayload {
      miniAppId: string;         // miniAppId
      description?: string;
      coverImgUrl: string;
      pagePath: string;
      thumbKey?: string;
      thumbUrl?: string;
      title: string;
      userName: string;      // userName
      displayName: string;
    }
  
    export class AppMsg {
      constructor(payload: AppMsgPayload);
    }
  
    export interface AppMsgPayload {
      appmsg: string;  // 小程序消息的xml字符串
    }
  
    export class Emoji {
      constructor(payload: EmojiPayload);
    }
  
    export interface EmojiPayload {
      emojiMd5: string;
      emojiSize: number;
    }
  
    export class ResponseMsg {
      revoke(): Promise<void>;  // 消息撤回
    }
  
    export interface GeweEventEmitter {
      on(event: string, listener: (...args: any[]) => void): this;
      off(event: string, listener: (...args: any[]) => void): this;
      emit(event: string, ...args: any[]): boolean;
    }
  
    export type MessageType = MessageStatic['Type'][keyof MessageStatic['Type']];
  
    export interface MessageQueryFilter {
      id?: string;
      from?: Contact;
      to?: Contact;
      type?: MessageType;
      room?: Room;
    }
  
    export default GeweBot;
}
