import axios from 'axios'
import JSONbig from 'json-bigint'
import { getToken } from '../utils/auth.js';

const baseURL = ''

// 创建一个 axios 实例
const service = axios.create({
  baseURL,
  responseType: 'text',
  transformResponse: [function (data) {
    try {
      // 使用 json-bigint 解析响应数据
      return JSONbig.parse(data);
    } catch (error) {
      // 解析失败则返回原始数据
      return data;
    }
  }],
  timeout: 60000 // 请求超时时间
})


export const setBaseUrl = (url) => {
  service.defaults.baseURL = url
}


// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在请求发送之前做一些处理
    config.headers['User-Agent'] = 'Apifox/1.0.0 (https://apifox.com)'
    config.headers['Content-Type'] = 'application/json'
    config.headers['X-GEWE-TOKEN'] = getToken()
    return config
  },
  error => {
    // 发送失败
    return Promise.reject(error)
  }
)


// 响应拦截器
service.interceptors.response.use(
  response => {
    // console.log(response.request.path)
    // console.log(response.data)
    // console.log(response.data.ret)
    if(response.config.allCode){
      return response.data
    }
    if (response.data.ret === 200) {
      return response.data.data
    }else{
      return Promise.reject(response.data)
    }
  },
  error => {
    console.error(error)
    return Promise.reject(error)
  }
)

// export const post = (url, data, config) => {
//   config = config === undefined ? {} : config;
//   return service({ url, method: "post", data, ...config });
// };

// post 方法
export const post = async (url, data, config = {}) => {
  try {
    // console.log('post-data', data)
    // 发送 POST 请求
    const response = await service({
      url,
      method: "post",
      data,
      ...config
    });
    return response;
  } catch (error) {
    // 在这里处理错误
    console.error(`请求${url}出错：`, error);
    console.log('请求数据为：', data)
    // 自定义处理逻辑，比如返回错误信息或处理默认返回值
    return {
      success: false,
      message: '请求失败',
      error: error.message || error
    };
  }
};