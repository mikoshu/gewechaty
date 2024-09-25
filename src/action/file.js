import {downloadFile} from '@/api/file'
import {FileBaseUrl} from '@/request/fileRequest.js'
import {getAppId} from '@/utils/auth.js'
import {joinURL} from '@/utils/index'
const appId = getAppId()
export const toFileBox = async (xml, type = 2) => {
  try{
    const {fileUrl} = await downloadFile({
      appId,
      xml,
      type
    })
    const url = joinURL(FileBaseUrl, fileUrl)
    return url
  }catch(e){
    console.error(e)
  }
    
  
}