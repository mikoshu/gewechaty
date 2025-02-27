import {setFriendRemark, findContact, getInfo, findAllContact, AddContact} from '@/api/contact'
import {GetRoomInfo} from '@/api/room.js'
import {getAppId} from '@/utils/auth.js'
import {Contact} from '@/class/CONTACT'
import {db} from '@/sql/index.js'
// import {getCached} from '@/action/common.js'

export const setRemark = async (wxid, remark) => {
  await setFriendRemark({
    appId: getAppId(),
    wxid,
    remark
  })
}

export const getContact = async (wxid) => { // 使用id查询
  let contact = null
  contact = db.findOneByWxId(wxid)
  if(!contact){ // 未缓存 则查询
    const info = await getInfo({
      appId: getAppId(),
      wxids: [wxid]
    })
    if(!info || info.length === 0){
      console.log('未找到')
      return null
    }
    contact = info[0] || null
    if(contact){ // 插入缓存
      db.insertContact(contact)
    }
  }
  return contact ? new Contact(contact) : null
}

export const contactSync = async (wxid) => {
  const info = await getInfo({
    appId: getAppId(),
    wxids: [wxid]
  })
  if(!info || info.length === 0){
    console.log('未找到')
    return null
  }
  let contact = info[0] || null
  if(contact){ // 插入缓存
    db.insertContact(contact)
  }
  return contact ? new Contact(contact) : null
}


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
export const find = async (content) => { // 使用name alias wxid查询
  let contact = null
  if(typeof content ==='string' && content !== ''){
    contact = db.findOneByWxId(content)
  }else if(typeof content ==='object'){
    if(content.name){
      contact = db.findOneByName(content.name)
    }else if(content.alias){
      contact = db.findOneByAlias(content.alias)
    }else if(content.id){ // 兼容旧代码，现已规范化为wxid
      contact = db.findOneByWxId(content.id)
    }else if(content.wxid){
      contact = db.findOneByWxId(content.wxid)
    }else{
      throw new Error('不支持的查询内容')
    }
  }else{
    throw new Error('不支持的查询内容')
  }
  return contact? new Contact(contact) : null
}

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
export const findAll = async (query) => {
  let rows = []
  if(!query){
    rows = db.findAllContacts()
  }else if(typeof query ==='object'){
    if(query.name){
      rows = db.findAllByName(query.name)
    }else if(query.alias){
      rows = db.findAllByAlias(query.alias)
    }else{
      throw new Error('至少需要一个查询条件')
    }
  }else{
    throw new Error('不支持的查询内容')
  }
  const arr = rows.map(item => new Contact(item))
  return arr
}


// 获取所有好友缓存所有数据到本地db
export const cacheAllContact = async () => {
  try {
    console.log('获取用户所有好友以及群信息中...')
    const res = await findAllContact({
      appId: getAppId()
    });
    console.log('获取用户所有好友以及群信息完成，开始缓存内容...')
    if (res && res.friends) {
      let wxids = res.friends;
      wxids = wxids.filter(item => item && !item.startsWith('gh_') && item !== null && item !== 'null');
      await processBatch(wxids, 20, async (batch) => {
        const info = await getInfo({
          appId: getAppId(),
          wxids: batch
        });
        if (info && info.length > 0) {
          info.forEach(item => {
            db.insertContact(item);
          });
        }
      });
      console.log(`缓存联系人完成`)
    }

    if (res && res.chatrooms) {
      let wxids = res.chatrooms;
      wxids = wxids.filter(item => item && item !== null && item !== 'null');
      await processBatch(wxids, 1, async (batch) => {
        const info = await GetRoomInfo({
          appId: getAppId(),
          chatroomId: batch[0]
        });
        if (info) {
          db.insertRoom(info);
        }
      });
      console.log(`缓存群信息完成，（只缓存有保存的群，其他群信息将在首次接收到时同步缓存）`)
    }
  } catch (e) {
    console.error(e);
    return null;
  }
};

// 辅助函数：分批处理数组
const processBatch = async (array, batchSize, callback) => {
  for (let i = 0; i < array.length; i += batchSize) {
    const batch = array.slice(i, i + batchSize); // 分割数组
    await callback(batch);  // 每一批次执行传入的回调函数
  }
};


export const acceptContact = async (scene, v3, v4) => {
  const res = await AddContact({
    appId: getAppId(),
    scene,
    option: 3, // 操作类型，2添加好友 3同意好友 4拒绝好友
    v3,
    v4,
    content: 'hello'
  })
  return res
}

export const addContact = async (v3, v4, content) => {
  const res = await AddContact({
    appId: getAppId(),
    scene: 15,
    option: 2, // 操作类型，2添加好友 3同意好友 4拒绝好友
    v3,
    v4,
    content
  })
  return res
}

export const rejectContact = async (scene, v3, v4, content) => {
  const res = await AddContact({
    appId: getAppId(),
    scene,
    option: 4, // 操作类型，2添加好友 3同意好友 4拒绝好友
    v3,
    v4,
    content
  })
  return res
}

export const searchContact = async (mobile) => {
  // 应为添加好友时使用
  const res = await findContact({
    appId: getAppId(),
    contactsInfo: mobile
  })
  if(res){
    return res
  }else{
    return null
  }
}