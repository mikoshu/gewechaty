import Database from './sqlite-module';
import fs from 'fs';
import {getRoomMemberList} from '@/action/room.js'

class MyDB {
  constructor() {
    this.db = null;
  }

  /** 检查数据库是否存在 */
  exists(dbName) {
    return fs.existsSync(dbName);
  }

  /** 传入数据库名称，检查是否存在数据库，存在则返回db实例，不存在则创建并返回实例 */
  connect(dbName) {
    if (!fs.existsSync(dbName)) {
      console.log(`Database ${dbName} does not exist, creating...`);
    }
    this.db = new Database(dbName);
    console.log(`Connected to database: ${dbName}`);
    return this.db;
  }

  /** 尝试创建contact表，如果该表已存在则不生效 */
  createContactTable() {
    const tableName = 'contact';
    const tableSchema = `
      userName TEXT PRIMARY KEY,
      nickName TEXT,
      pyInitial TEXT,
      quanPin TEXT,
      sex INTEGER,
      remark TEXT,
      remarkPyInitial TEXT,
      remarkQuanPin TEXT,
      signature TEXT,
      alias TEXT,
      snsBgImg TEXT,
      country TEXT,
      bigHeadImgUrl TEXT,
      smallHeadImgUrl TEXT,
      description TEXT,
      cardImgUrl TEXT,
      labelList TEXT,
      province TEXT,
      city TEXT,
      phoneNumList TEXT
    `;

    const tableExists = this.db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(tableName);
    if (!tableExists) {
      console.log(`Table ${tableName} does not exist, creating...`);
      this.db.exec(`CREATE TABLE ${tableName} (${tableSchema})`);
    } else {
      console.log(`Table ${tableName} already exists.`);
    }
  }

  /** 尝试创建room表，如果该表已存在则不生效 */
  createRoomTable() {
    const tableName = 'room';
    const tableSchema = `
      chatroomId TEXT PRIMARY KEY,
      nickName TEXT,
      pyInitial TEXT,
      quanPin TEXT,
      sex INTEGER,
      remark TEXT,
      remarkPyInitial TEXT,
      remarkQuanPin TEXT,
      chatRoomNotify INTEGER,
      chatRoomOwner TEXT,
      smallHeadImgUrl TEXT,
      memberList TEXT
    `;

    const tableExists = this.db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(tableName);
    if (!tableExists) {
      console.log(`Table ${tableName} does not exist, creating...`);
      this.db.exec(`CREATE TABLE ${tableName} (${tableSchema})`);
    } else {
      // 检查是否存在 memberList 字段，如果不存在则添加
      const columns = this.db.prepare(`PRAGMA table_info(${tableName})`).all();
      const columnNames = columns.map(column => column.name);
      if (!columnNames.includes('memberList')) {
        console.log(`Adding memberList column to ${tableName} table...`);
        this.db.exec(`ALTER TABLE ${tableName} ADD COLUMN memberList TEXT`);
      } else {
        console.log(`Table ${tableName} already exists and has memberList column.`);
      }
    }
  }

  /** 根据 wxid 查找联系人，返回该条数据或 null */
  findOneByWxId(wxid) {
    const stmt = this.db.prepare('SELECT * FROM contact WHERE userName = ?');
    const row = stmt.get(wxid);
    return row ? row : null;
  }
  /** 根据昵称查找联系人，返回该条数据或 null */
  findOneByName(nickName) {
    const stmt = this.db.prepare('SELECT * FROM contact WHERE nickName = ?');
    const row = stmt.get(nickName);
    return row ? row : null;
  }
  /** 根据昵称查找全部符合条件的联系人，返回数据数组或空数组 */
  findAllByName(nickName) {
    const stmt = this.db.prepare('SELECT * FROM contact WHERE nickName = ?');
    const rows = stmt.all(nickName);
    return rows; // 当没有匹配的记录时，会返回空数组
  }
  /** 根据微信备注查找联系人，返回该条数据或 null */
  findOneByAlias(alias) {
    const stmt = this.db.prepare('SELECT * FROM contact WHERE remark = ?');
    const row = stmt.get(alias);
    return row ? row : null;
  }
  /** 根据微信备注查找全部符合条件的联系人，返回数据数组或空数组 */
  findAllByAlias(alias) {
    const stmt = this.db.prepare('SELECT * FROM contact WHERE remark = ?');
    const rows = stmt.all(alias);
    return rows; // 当没有匹配的记录时，会返回空数组
  }

  /** 根据 chatroomId 查找群聊，返回该条数据或 null */
  findOneByChatroomId(chatroomId) {
    const stmt = this.db.prepare('SELECT * FROM room WHERE chatroomId = ?');
    const row = stmt.get(chatroomId);
    if (row && row.memberList) {
      row.memberList = JSON.parse(row.memberList); // 将 memberList 从 JSON 格式解析
    }
    return row ? row : null;
  }
  /** 根据群聊名称查找群聊，返回该条数据或 null */
  findOneByChatroomName(name) {
    const stmt = this.db.prepare('SELECT * FROM room WHERE nickName = ?');
    const row = stmt.get(name);
    return row ? row : null;
  }
  /** 根据群聊名称查找全部符合条件的群聊，返回数据数组或空数组 */
  findAllByChatroomName(name) {
    const stmt = this.db.prepare('SELECT * FROM room WHERE nickName = ?');
    const rows = stmt.all(name);
    return rows; // 当没有匹配的记录时，会返回空数组
  }

  /** 更新 room 表中的 memberList 字段，返回成功更改的记录数量 */
  updateRoomMemberList(chatroomId, memberList) {
    const existingRoom = this.findOneByChatroomId(chatroomId);
    if (!existingRoom) {
      console.log(`Room ${chatroomId} does not exist.`);
      return;
    }

    const updateStmt = this.db.prepare(`
      UPDATE room SET memberList = ? WHERE chatroomId = ?
    `);

    // 将 memberList 转换为 JSON 字符串并更新
    const changes = updateStmt.run(JSON.stringify(memberList), chatroomId);

    console.log(`Updated memberList for room: ${chatroomId}`);

    return changes;
  }

  /** 插入新的联系人数据，如果存在则更新，返回成功更改的记录数量 */
  insertContact(contact) {
    if (contact.userName === null) {
      return;
    }

    // 定义字段的最大长度
    const MAX_LENGTH = 255;

    // 用一个函数来截断字符串
    const truncate = (value, maxLength = MAX_LENGTH) => {
      if (typeof value === 'string' && value.length > maxLength) {
        return value.substring(0, maxLength);
      }
      return value;
    };

    const insertStmt = this.db.prepare(`
      INSERT OR REPLACE INTO contact (
        userName, nickName, pyInitial, quanPin, sex, remark, remarkPyInitial,
        remarkQuanPin, signature, alias, snsBgImg, country, bigHeadImgUrl,
        smallHeadImgUrl, description, cardImgUrl, labelList, province, city, phoneNumList
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const changes = insertStmt.run(
      truncate(contact.userName) || null,
      truncate(contact.nickName) || null,
      truncate(contact.pyInitial) || null,
      truncate(contact.quanPin) || null,
      contact.sex || null,
      truncate(contact.remark) || null,
      truncate(contact.remarkPyInitial) || null,
      truncate(contact.remarkQuanPin) || null,
      truncate(contact.signature) || null,
      truncate(contact.alias) || null,
      truncate(contact.snsBgImg) || null,
      truncate(contact.country) || null,
      truncate(contact.bigHeadImgUrl) || null,
      truncate(contact.smallHeadImgUrl) || null,
      truncate(contact.description) || null,
      truncate(contact.cardImgUrl) || null,
      truncate(contact.labelList) || null,
      truncate(contact.province) || null,
      truncate(contact.city) || null,
      truncate(contact.phoneNumList) || null
    );

    console.log(`缓存联系人: ${contact.userName}`);

    return changes;
  }

  /** 插入新的群聊数据，如果存在则更新，返回成功更改的记录数量 */
  insertRoom(room) {
    if(room.chatroomId === null){
      return
    }
    const insertStmt = this.db.prepare(`
      INSERT OR REPLACE INTO room (
        chatroomId, nickName, pyInitial, quanPin, sex, remark, remarkPyInitial,
        remarkQuanPin, chatRoomNotify, chatRoomOwner, smallHeadImgUrl, memberList
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const changes = insertStmt.run(
      room.chatroomId || null,
      room.nickName || null,
      room.pyInitial || null,
      room.quanPin || null,
      room.sex || null,
      room.remark || null,
      room.remarkPyInitial || null,
      room.remarkQuanPin || null,
      room.chatRoomNotify || null,
      room.chatRoomOwner || null,
      room.smallHeadImgUrl || null,
      room.memberList ? JSON.stringify(room.memberList) : null
    );

    console.log(`缓存群: ${room.chatroomId}`);

    return changes;
  }

  /** 更新联系人数据，返回成功更改的记录数量 */
  updateContact(userName, newData) {
    const existingContact = this.findOneByUserName(userName);
    if (!existingContact) {
      console.log(`Contact ${userName} does not exist.`);
      return;
    }

    const updateStmt = this.db.prepare(`
      UPDATE contact SET
        nickName = ?, pyInitial = ?, quanPin = ?, sex = ?, remark = ?, remarkPyInitial = ?,
        remarkQuanPin = ?, signature = ?, alias = ?, snsBgImg = ?, country = ?, bigHeadImgUrl = ?,
        smallHeadImgUrl = ?, description = ?, cardImgUrl = ?, labelList = ?, province = ?, city = ?, phoneNumList = ?
      WHERE userName = ?
    `);

    const changes = updateStmt.run(
      newData.nickName || existingContact.nickName,
      newData.pyInitial || existingContact.pyInitial,
      newData.quanPin || existingContact.quanPin,
      newData.sex || existingContact.sex,
      newData.remark || existingContact.remark,
      newData.remarkPyInitial || existingContact.remarkPyInitial,
      newData.remarkQuanPin || existingContact.remarkQuanPin,
      newData.signature || existingContact.signature,
      newData.alias || existingContact.alias,
      newData.snsBgImg || existingContact.snsBgImg,
      newData.country || existingContact.country,
      newData.bigHeadImgUrl || existingContact.bigHeadImgUrl,
      newData.smallHeadImgUrl || existingContact.smallHeadImgUrl,
      newData.description || existingContact.description,
      newData.cardImgUrl || existingContact.cardImgUrl,
      newData.labelList || existingContact.labelList,
      newData.province || existingContact.province,
      newData.city || existingContact.city,
      newData.phoneNumList || existingContact.phoneNumList,
      userName
    );

    console.log(`Updated contact: ${userName}`);

    return changes;
  }
  /** 更新群聊数据，返回成功更改的记录数量 */
  async updateRoom(chatroomId, newData) {
    const existingRoom = this.findOneByChatroomId(chatroomId);
    if (!existingRoom) {
      console.log(`Room ${chatroomId} does not exist.`);
      return;
    }

    const updateStmt = this.db.prepare(`
      UPDATE room SET
        nickName = ?, pyInitial = ?, quanPin = ?, sex = ?, remark = ?, remarkPyInitial = ?,
        remarkQuanPin = ?, chatRoomNotify = ?, chatRoomOwner = ?, smallHeadImgUrl = ?, memberList = ?
      WHERE chatroomId = ?
    `);

    const res = await getRoomMemberList(chatroomId) // 更新memberlist
    if(res && res.memberList){
      newData.memberList = res.memberList
    }
    if(!newData || !newData.memberList){
      return
    }
    const changes = updateStmt.run(
      newData.nickName || existingRoom.nickName,
      newData.pyInitial || existingRoom.pyInitial,
      newData.quanPin || existingRoom.quanPin,
      newData.sex || existingRoom.sex,
      newData.remark || existingRoom.remark,
      newData.remarkPyInitial || existingRoom.remarkPyInitial,
      newData.remarkQuanPin || existingRoom.remarkQuanPin,
      newData.chatRoomNotify || existingRoom.chatRoomNotify,
      newData.chatRoomOwner || existingRoom.chatRoomOwner,
      newData.smallHeadImgUrl || existingRoom.smallHeadImgUrl,
      newData.memberList ? JSON.stringify(newData.memberList) : existingRoom.memberList, // 转换为 JSON 字符串
      chatroomId
    );

    console.log(`Updated room: ${chatroomId}`);

    return changes;
  }

  /** 查询所有联系人数据 */
  findAllContacts() {
    const stmt = this.db.prepare('SELECT * FROM contact');
    const rows = stmt.all(); // 获取所有记录
    return rows;
  }

  /** 查询所有群聊数据 */
  findAllRooms() {
    const stmt = this.db.prepare('SELECT * FROM room');
    const rows = stmt.all();
    return rows.map(row => {
      if (row.memberList) {
        row.memberList = JSON.parse(row.memberList); // 将 memberList 转换为 JSON 格式
      }
      return row;
    });
  }
}

export const db = new MyDB();
