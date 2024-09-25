import axios from 'axios'
import fs from 'fs';
import path from 'path';

export let FileBaseUrl = ''

// 创建一个 axios 实例
const service = axios.create({
  baseURL: '',
  timeout: 30000 // 请求超时时间
})


export const setFileUrl = (url) => {
  service.defaults.baseURL = url
  FileBaseUrl = url
}

export const downloadFile = async (url, filePath) => {
    // 检查文件路径的目录是否存在，不存在则创建
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // 使用 axios 下载文件
    try {
        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'stream', // 将响应数据作为流处理
        });

        // 创建文件写入流
        const writer = fs.createWriteStream(filePath);

        // 将下载的文件流传入文件写入流中
        response.data.pipe(writer);

        // 返回一个 Promise，确保文件写入完成后再返回
        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`File downloaded to: ${filePath}`);
                resolve();
            });
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Download failed: ${error.message}`);
        throw error;
    }
}