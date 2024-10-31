import qrTerminal from 'qrcode-terminal'
import { GetToken, GetQrcode, CheckLogin, Logout, Reconnection } from "@/api/login.js";
import { setToken, setAppId, getAppId, setUuid, getUuid } from '@/utils/auth.js';
import { botEmitter } from '@/bot.js'

let loginStatus = 0
// const appId = getAppId()
// 获取token
export const getToken = async() => {
  return new Promise((resolve, reject) => {
    GetToken().then(res => {
      if(res.ret === 200){
        setToken(res.data)
        resolve()
      }else{ 
        reject()
      }
    }).catch(e => {
      reject(e)
    })
  })

}
// 展示二维码
const showQrcode = async() => {
  await getToken()
  try{
    const res = await GetQrcode({
      appId: getAppId()
    })
    console.log('获取二维码返回值：', res)
    if(res.ret !== 200){
      console.log('获取二维码失败')
      return false
    }
    console.log("输入的appid：", getAppId())
    console.log('返回的appid:', res.data.appId)
    if(res.data.appId){
      setAppId(res.data.appId)
      setUuid(res.data.uuid)
    }
    qrTerminal.generate(res.data.qrData, { small: true })
    const qrcodeImageUrl = ['https://api.qrserver.com/v1/create-qr-code/?data=', encodeURIComponent(res.data.qrData)].join('')
    // console.log('onScan:', qrcodeImageUrl)
    botEmitter.emit('scan', {
      content: res.data.qrData,
      url: qrcodeImageUrl
    })
    return true
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
  loginStatus = res.data.status
}

function waitForCondition() {
  return new Promise((resolve) => {
    function checkCondition() {
      checkLogin().then(() => {
        if (loginStatus === 2) {
          // 条件满足，调用 resolve
          resolve(true);
        } else {
          // 条件不满足，等待 5 秒后再次调用
          console.log('请扫码登录...');
          setTimeout(checkCondition, 5000);
        }
      }).catch(e => {
        console.log('检查登录失败')
        console.error(e)
        resolve(false)
      })
    }
    checkCondition();
  });
}



export const login = async (callbackUrl) => {
  try{
    const res = await showQrcode()
    console.log('showQrcode:', res)
    if(res){
      return await waitForCondition()
    }else{
      return false
    }
  }catch(e){
    console.error(e)
    return false
  }
}

export const logout = async () => {
  try{
    const res = await Logout({
      appId: getAppId()
    })
    if(res.ret === 200){
      return true
    }else{
      return false
    }
  }catch(e){
    console.error(e)
    return false
  }
}

export const reconnection = async () => {
  try{
    const res = await Reconnection({
      appId: getAppId()
    })
    if(res.ret === 200){
      return true
    }else{
      return false
    }
  }catch(e){
    console.error(e)
    return false
  }
}