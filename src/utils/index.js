import os from 'os';
export const getLocalIPAddress = () => {
  const interfaces = os.networkInterfaces();
  let localIPAddress = '';

  for (let interfaceName in interfaces) {
      const addresses = interfaces[interfaceName];
      for (let i = 0; i < addresses.length; i++) {
          const addressInfo = addresses[i];
          
          // 确保选择的是 IPv4，并且不是本地环回接口
          if (addressInfo.family === 'IPv4' && !addressInfo.internal) {
              // 排除虚拟网络的IP地址
              if (addressInfo.address.startsWith('192.') || addressInfo.address.startsWith('10.') || addressInfo.address.startsWith('172.')) {
                  localIPAddress = addressInfo.address;
                  break;
              }
          }
      }
  }

  return localIPAddress;
}
/**
 *
 * @param {*} timestamp 10位的秒级时间戳
 * @param {*} time 分钟
 * @returns
 */
export const timeWithin = (timestamp, time = 2) => {
  const currentTime = Date.now(); // 当前时间的毫秒级时间戳
  const targetTime = timestamp * 1000; // 将10位的秒级时间戳转换为毫秒级时间戳
  
  const timeDifference = currentTime - targetTime; // 计算时间差
  
  // 判断时间差是否大于2分钟（120秒 = 120000毫秒）
  if (timeDifference > time * 60000) {
      return false; // 超过2分钟，返回false
  }
  
  return true; // 在2分钟之内，返回true
}

/**
 *
 * @param {*} link 链接
 * @returns
 */
export const  getFileNameFromUrl = (link) => {
    console.log('link', link)
    return link.split('/').pop();
}

export const joinURL = (...parts) => {
    // 过滤掉空值（null、undefined 或空字符串），并且去除每个部分的开头和结尾的斜杠
    const validParts = parts.filter(part => part).map(part => part.replace(/^\/+|\/+$/g, ''));
    // 使用 '/' 拼接所有有效部分
    return validParts.join('/');
}
// getFileNameFromUrl('http://121.37.193.110:2532/download/20240924/wx_jk5smGp4fqSz4A3haz0_7/76764118-925f-421e-a93e-c3dbc6f4651f.png')