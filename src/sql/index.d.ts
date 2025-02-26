import { type Database as DatabaseSqlite3 } from 'better-sqlite3';
import { type Database as DatabaseBun } from 'bun:sqlite';

/** 群成员的接口定义 */
export declare interface RoomMemberInDB {
  /** 用户唯一标识 */
  wxid: string;
  /** 用户昵称 */
  nickName: string;
  /** 邀请者用户名，可能为 null */
  inviterUserName: string | null;
  /** 成员标志 */
  memberFlag: number;
  /** 疑似为群昵称？可能为 null */
  displayName: string | null;
  /** 大头像 URL */
  bigHeadImgUrl: string;
  /** 小头像 URL */
  smallHeadImgUrl: string;
}

/** 联系人的接口定义 */
declare interface ContactInDb {
  userName: string | null;
  nickName: string | null;
  pyInitial: string | null;
  quanPin: string | null;
  sex: number | null;
  remark: string | null;
  remarkPyInitial: string | null;
  remarkQuanPin: string | null;
  signature: string | null;
  alias: string | null;
  snsBgImg: string | null;
  country: string | null;
  bigHeadImgUrl: string | null;
  smallHeadImgUrl: string | null;
  description: string | null;
  cardImgUrl: string | null;
  labelList: string | null;
  province: string | null;
  city: string | null;
  phoneNumList: string | null;
}

/** 联系人的接口定义，所有字段为可选的 */
declare interface ContactInDbOptional {
  userName: string | undefined;
  nickName: string | undefined;
  pyInitial: string | undefined;
  quanPin: string | undefined;
  sex: number | undefined;
  remark: string | undefined;
  remarkPyInitial: string | undefined;
  remarkQuanPin: string | undefined;
  signature: string | undefined;
  alias: string | undefined;
  snsBgImg: string | undefined;
  country: string | undefined;
  bigHeadImgUrl: string | undefined;
  smallHeadImgUrl: string | undefined;
  description: string | undefined;
  cardImgUrl: string | undefined;
  labelList: string | undefined;
  province: string | undefined;
  city: string | undefined;
  phoneNumList: string | undefined;
}

/** 群聊的接口定义 */
declare interface RoomInDb {
  chatroomId: string | null;
  nickName: string | null;
  pyInitial: string | null;
  quanPin: string | null;
  sex: number | null;
  remark: string | null;
  remarkPyInitial: string | null;
  remarkQuanPin: string | null;
  chatRoomNotify: number | null;
  chatRoomOwner: string | null;
  smallHeadImgUrl: string | null;
  memberList: RoomMemberInDB[] | null; // 已解析为对象数组
}

export declare class MyDB {
  db: DatabaseSqlite3 | DatabaseBun | null;

  constructor();

  /** 检查数据库是否存在 */
  exists(dbName: string): boolean;
  /** 传入数据库名称，检查是否存在数据库，存在则返回 db 实例，不存在则创建并返回实例 */
  connect(dbName: string): DatabaseSqlite3 | DatabaseBun;
  /** 尝试创建contact表，如果该表已存在则不生效 */
  createContactTable(): void;
  /** 尝试创建room表，如果该表已存在则不生效 */
  createRoomTable(): void;

  /** 根据 wxid 查找联系人，返回该条数据或 null */
  findOneByWxId(wxid: string): ContactInDb | null;
  /** 根据昵称查找联系人，返回该条数据或 null */
  findOneByName(nickName: string): ContactInDb | null;
  /** 根据昵称查找全部符合条件的联系人，返回数据数组或空数组 */
  findAllByName(nickName: string): ContactInDb[];
  /** 根据微信备注查找联系人，返回该条数据或 null */
  findOneByAlias(alias: string): ContactInDb | null;
  /** 根据微信备注查找全部符合条件的联系人，返回数据数组或空数组 */
  findAllByAlias(alias: string): ContactInDb[];

  /** 根据 chatroomId 查找群聊，返回该条数据或 null */
  findOneByChatroomId(chatroomId: string): RoomInDb | null;
  /** 根据群聊名称查找群聊，返回该条数据或 null */
  findOneByChatroomName(name: string): RoomInDb | null;
  /** 根据群聊名称查找全部符合条件的群聊，返回数据数组或空数组 */
  findAllByChatroomName(name: string): RoomInDb[];

  /** 更新 room 表中的 memberList 字段，返回成功更改的记录数量 */
  updateRoomMemberList(chatroomId: string, memberList: RoomMemberInDB[]): number;

  /** 插入新的联系人数据，如果存在则更新，返回成功更改的记录数量 */
  insertContact(contact: ContactInDbOptional): number;
  /** 插入新的群聊数据，如果存在则更新，返回成功更改的记录数量 */
  insertRoom(room: RoomInDb): number;

  /** 更新联系人数据，返回成功更改的记录数量 */
  updateContact(userName: string, newData: Partial<ContactInDbOptional>): number;
  /** 更新群聊数据，返回成功更改的记录数量 */
  updateRoom(chatroomId: string, newData: Partial<RoomInDb>): Promise<number>;

  /** 查询所有联系人数据 */
  findAllContacts(): ContactInDb[];
  /** 查询所有群聊数据 */
  findAllRooms(): RoomInDb[];
}

export const db: MyDB;
