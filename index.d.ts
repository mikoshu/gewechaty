declare module 'gewechaty' {
    export class GeweBot {
      constructor(options?: GeweBotOptions);
      db: any; // SQLite database instance
      use_cache: boolean;
      start(): Promise<{
        app: import('koa');
        router: import('koa-router');
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
      _name: string;
      _alias: string;
      _isFriend: boolean;
      _wxid: string | null;
      _type: number;
      _gender: number;
      _province: string | null;
      _city: string | null;
      _avatarUrl: string;
      _isSelf: boolean;
      inviterUserName: string;
  
      // Methods from CONTACT.js
      say(textOrContactOrFileOrUrl: string | Contact | Filebox | UrlLink | MiniApp): Promise<ResponseMsg>;
      name(): string;
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
      static find(query: ContactQueryFilter): Promise<Contact | undefined>;
      static findAll(query: ContactQueryFilter): Promise<Contact[]>;
    }
  
    export interface ContactStatic {
      find(query: ContactQueryFilter): Promise<Contact | undefined>;
      findAll(query: ContactQueryFilter): Promise<Contact[]>;
    }
  
    export interface ContactQueryFilter {
      name?: string;
      alias?: string;
      id?: string;
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
      memberList: any[];
  
      // Methods from ROOM.js
      sync(): Promise<Room>;
      say(textOrContactOrFileOrUrl: string | Contact | Filebox | UrlLink | MiniApp, ats?: Contact[] | '@all'): Promise<ResponseMsg>;
      on(event: 'join', listener: (room: Room, inviteeList: Contact[], inviter: Contact) => void): void;
      on(event: 'leave', listener: (room: Room, leaverList: Contact[], remover?: Contact) => void): void;
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
      type(): number;
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
        Unknown: 0;
        Text: 1;
        Image: number;
        Voice: number;
        AddFriend: number;
        Contact: number;
        Video: number;
        Emoji: number;
        Location: number;
        Link: number;
        File: number;
        RealTimeLocation: number;
        ChatHistroy: number;
        MiniApp: number;
        VideoAccount: number;
        Quote: number;
        FileStart: number;
        Transfer: number;
        RedPacket: number;
        Revoke: number;
        Pat: number;
        FunctionMsg: number;
        Voip: number;
        RoomInvitation: number;
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
      thumbUrl?: string;
    }
  
    export class MiniApp {
      constructor(payload: MiniAppPayload);
    }
  
    export interface MiniAppPayload {
      appid: string;         // miniAppId
      description?: string;
      iconUrl?: string;
      pagePath?: string;
      thumbKey?: string;
      thumbUrl?: string;
      title: string;
      username: string;      // userName
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
  
    export type MessageType = keyof MessageStatic["Type"];
  
    export interface MessageQueryFilter {
      id?: string;
      from?: Contact;
      to?: Contact;
      type?: MessageType;
      room?: Room;
    }
  
    export default GeweBot;
}