import {setFriendRemark, findContact, getInfo} from '@/api/contact'
import {getAppId} from '@/utils/auth.js'
import {Contact} from '@/class/CONTACT'
const appId = getAppId()

export const setRemark = async (wxid, remark) => {
  await setFriendRemark({
    appId,
    wxid,
    remark
  })
}

export const getContact = async (wxid) => {
  const info = await getInfo({
    appId,
    wxids: [wxid]
  })
  
  if(!info || info.length === 0){
    console.log('未找到')
    return null
  }
  const contact = new Contact(info[0]) || null
  return contact
}

export const find = async (content) => {
  let contactsInfo = ''
  if(typeof content === 'string'){
    contactsInfo = content
  }else if(typeof content ==='object'){
    contactsInfo = content.name || content.alias || content.wxid
  }
  if(!contactsInfo){
    console.log('请输入查询内容')
    return null
  }
  try{
    const {v3} = await findContact({
      appId,
      contactsInfo
    })
    if(v3 && v3.indexOf('v3_') !== 0){ // 此时为好友 v3为好友的wxid
      const info = await getInfo({
        appId,
        wxids: [v3]
      })
      const contact = new Contact(info[0])
      return contact
    }else{
      console.log('未找到')
      return null
    }
  }catch(e){
    console.error(e)
    return null
  }
  
}