import qrTerminal from 'qrcode-terminal'
import { GetToken, GetQrcode, CheckLogin } from "@/api/login.js";
import { setToken, setAppId, getAppId, setUuid, getUuid } from '@/utils/auth.js';

let loginStatus = 0
const appId = getAppId()
console.log('appid:',appId)
// 获取token
export const getToken = async() => {
  try{
    const res = await GetToken()
    if(res === 'success'){
      console.log('已登录')
      return true
    }else{
      setToken(res || '')
      return false
    }
  }catch(e){
    return false
  }
}
// 展示二维码
const showQrcode = async() => {
  if(await getToken()){ // 已登录 直接返回
    return true
  }
  try{
    const res = await GetQrcode({
      appId
    })
    if(res === 'success'){
      console.log('已登录')
      return true
    }
    console.log("输入的appid：", appId)
    console.log('返回的appid:', res.appId)
    if(res.appId){
      setAppId(res.appId)
      setUuid(res.uuid)
    }
    qrTerminal.generate(res.qrData, { small: true })
    const qrcodeImageUrl = ['https://api.qrserver.com/v1/create-qr-code/?data=', encodeURIComponent(res.qrData)].join('')
    console.log('onScan:', qrcodeImageUrl)
    return false
  }catch(e){
    console.error(e)
    return false
  } 
}

// 检查登录
const checkLogin = async() => {
  const res = await CheckLogin({
    appId: getAppId(),
    uuid: getUuid()
  })
  loginStatus = res.status
}

function waitForCondition() {
  return new Promise((resolve) => {
    function checkCondition() {
      checkLogin().then(() => {
        if (loginStatus === 2) {
          // 条件满足，调用 resolve
          resolve();
        } else {
          // 条件不满足，等待 5 秒后再次调用
          console.log('请扫码登录...');
          setTimeout(checkCondition, 5000);
        }
      });
    }
    checkCondition();
  });
}



export const login = async (callbackUrl) => {
  try{
    const res = await showQrcode()
    if(res){ // 已登录 直接返回
      return true
    }else{
      await waitForCondition()
    }
    
  }catch(e){
    console.error(e)
  }
}
