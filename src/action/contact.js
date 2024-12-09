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


export const find = async (content) => { // 使用name alias wxid查询
  let contactsInfo = ''
  if(typeof content === 'string'){
    contactsInfo = content

  }else if(typeof content ==='object'){
    contactsInfo = content.name || content.alias || content.id
  }else{
    console.log('不支持的查询内容')
    return null
  }
  if(!contactsInfo){
    console.log('查询内容不能为空')
    return null
  }


  let contact = null
  if(typeof content ==='string'){
    contact = db.findOneByWxId(content)
  }else if(typeof content ==='object'){
    if(content.name){
      contact = db.findOneByName(content.name)
    }else if(content.alias){
      contact = db.findOneByAlias(content.alias)
    }else if(content.id){
      contact = db.findOneByWxId(content.id)
    }else{
      console.log('不支持的查询内容')
      return null
    }
  }
  return contact? new Contact(contact) : null
}

export const findAll = async (query) => {
  let arr = []
  let rows = []
  if(!query){
    rows = db.findAllContacts()
  }else if(typeof query ==='object'){
    if(query.name){
      rows = db.findAllByName(query.name)
    }else if(query.alias){
      rows = db.findAllByAlias(query.alias)
    }else{
      console.log('不支持的查询内容')
      return arr
    }
  }
  rows.map(item => {
    arr.push(new Contact(item))
  })
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