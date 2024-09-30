import {setFriendRemark, findContact, getInfo, findAllContact} from '@/api/contact'
import {GetRoomInfo} from '@/api/room.js'
import {getAppId} from '@/utils/auth.js'
import {Contact} from '@/class/CONTACT'
import {db} from '@/sql/index.js'
// import {getCached} from '@/action/common.js'
const appId = getAppId()

export const setRemark = async (wxid, remark) => {
  await setFriendRemark({
    appId,
    wxid,
    remark
  })
}

export const getContact = async (wxid) => { // 使用id查询
  const contact = null
  contact = db.findOneByWxId(wxid)
  if(!contact){ // 未缓存 则查询
    const info = await getInfo({
      appId,
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

export const find = async (content) => { // 使用name alias wxid查询
  let contactsInfo = ''
  if(typeof content === 'string'){
    contactsInfo = content

  }else if(typeof content ==='object'){
    contactsInfo = content.name || content.alias
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
    }else{
      console.log('不支持的查询内容')
      return null
    }
  }
  
  return contact? new Contact(contact) : null

  // 应为添加好友时使用
  // try{
  //   const {v3} = await findContact({
  //     appId,
  //     contactsInfo
  //   })
  //   if(v3 && v3.indexOf('v3_') !== 0){ // 此时为好友 v3为好友的wxid
  //     const info = await getInfo({
  //       appId,
  //       wxids: [v3]
  //     })
  //     const contact = new Contact(info[0])
  //     return contact
  //   }else{
  //     console.log('未找到')
  //     return null
  //   }
  // }catch(e){
  //   console.error(e)
  //   return null
  // }
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
  try{
    const res = await findAllContact({
      appId
    })
    if(res && res.friends){ // 返回一个wxid数组
      const wxids = res.friends
      const info = await getInfo({
        appId,
        wxids
      })
      if(info && info.length > 0){
        info.forEach(item => {
          db.insertContact(item)
        })
      }
    }
    if(res && res.chatrooms){ // 返回一个wxid数组
      const wxids = res.chatrooms
      wxids.forEach(async item => {
        const info = await GetRoomInfo({
          appId,
          wxids
        })
        if(info){
          db.insertRoom(item)
        }
      })
      
      
    }
  }catch(e){
    console.error(e)
    return null
  }
}