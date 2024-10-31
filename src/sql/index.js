import Database from 'better-sqlite3';
import fs from 'fs';
import {getRoomMemberList} from '@/action/room.js'

class myDB {
  constructor() {
    this.db = null;
  }

  exists(dbName) {
    return fs.existsSync(dbName);
  }

  // 方法1：传入数据库名称，检查是否存在数据库，存在则返回db实例，不存在则创建并返回实例
  connect(dbName) {
    if (!fs.existsSync(dbName)) {
      console.log(`Database ${dbName} does not exist, creating...`);
    }
    this.db = new Database(dbName);
    console.log(`Connected to database: ${dbName}`);
    return this.db;
  }

  // 方法2：创建contact表，如果不存在则创建
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

  // 方法2：创建room表，如果不存在则创建
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

  // 方法3：根据 userName 查找联系人，返回该条数据或 null
  findOneByWxId(wxid) {
    const stmt = this.db.prepare('SELECT * FROM contact WHERE userName = ?');
    const row = stmt.get(wxid);
    return row ? row : null;
  }

  findOneByName(nickName) {
    const stmt = this.db.prepare('SELECT * FROM contact WHERE nickName = ?');
    const row = stmt.get(nickName);
    return row ? row : null;
  }
  findAllByName(nickName) {
    const stmt = this.db.prepare('SELECT * FROM contact WHERE nickName = ?');
    const rows = stmt.all(nickName);
    return rows.length > 0 ? rows : null;
  }

  findOneByAlias(alias) {
    const stmt = this.db.prepare('SELECT * FROM contact WHERE remark = ?');
    const row = stmt.get(alias);
    return row ? row : null;
  }

  findAllByAlias(alias) {
    const stmt = this.db.prepare('SELECT * FROM contact WHERE remark = ?');
    const rows = stmt.all(alias);
    return rows.length > 0 ? rows : null;
  }

  // 方法3：根据 chatroomId 查找房间，返回该条数据或 null
  findOneByChatroomId(chatroomId) {
    const stmt = this.db.prepare('SELECT * FROM room WHERE chatroomId = ?');
    const row = stmt.get(chatroomId);
    if (row && row.memberList) {
      row.memberList = JSON.parse(row.memberList); // 将 memberList 转换为 JSON 格式
    }
    return row ? row : null;
  }

  findOneByChatroomName(name) {
    const stmt = this.db.prepare('SELECT * FROM room WHERE nickName = ?');
    const row = stmt.get(name);
    return row ? row : null;
  }

  findAllByChatroomName(name) {
    const stmt = this.db.prepare('SELECT * FROM room WHERE nickName = ?');
    const rows = stmt.all(name);
    return rows.length > 0 ? rows : null;
  }

  // 新增方法：更新room表中的memberList字段
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
    updateStmt.run(JSON.stringify(memberList), chatroomId);

    console.log(`Updated memberList for room: ${chatroomId}`);
  }

  // 方法4：插入新的联系人数据，如果存在则更新
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
  
    insertStmt.run(
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
  }

  // 方法4：插入新的房间数据，如果存在则更新
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

    insertStmt.run(
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
  }
  // 方法5：更新联系人数据
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

    updateStmt.run(
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
  }

  // 方法5：更新房间数据
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
    updateStmt.run(
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
  }
  // 方法6：查询所有联系人数据
  findAllContacts() {
    const stmt = this.db.prepare('SELECT * FROM contact');
    const rows = stmt.all(); // 获取所有记录
    return rows;
  }

  // 方法7：查询所有房间数据
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

export const db = new myDB();
