import qrTerminal from 'qrcode-terminal'
import { GetToken, GetQrcode, CheckLogin } from "@/api/login.js";
import { setToken, setAppId, getAppId, setUuid, getUuid } from '@/utils/auth.js';

let loginStatus = 0
const appId = getAppId()
console.log('appid:',appId)
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
      appId
    })
    if(res.ret !== 200){
      console.log('获取二维码失败')
      return false
    }
    console.log("输入的appid：", appId)
    console.log('返回的appid:', res.data.appId)
    if(res.data.appId){
      setAppId(res.data.appId)
      setUuid(res.data.uuid)
    }
    qrTerminal.generate(res.data.qrData, { small: true })
    const qrcodeImageUrl = ['https://api.qrserver.com/v1/create-qr-code/?data=', encodeURIComponent(res.data.qrData)].join('')
    console.log('onScan:', qrcodeImageUrl)
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
