import {downloadFile} from '@/request/fileRequest.js'
import {getFileNameFromUrl, joinURL} from '@/utils/index.js'
import { join, basename } from 'path';
import fs from 'fs'
import {staticUrl, proxyUrl} from '@/server/index'
const tempname = '_gewetemp'


export class Filebox {
  constructor() {
    this.url = ''
    this.type = ''
    this.name = ''
  }
  static fromUrl(url, forceType){
    const instance = new Filebox()
    const supportType = ['image', 'file']
    const type = forceType || Filebox.getFileType(url)
    if(!supportType.includes(type)){
      throw new Error('Filebox只支持图片和文件类型，语音和视频使用 new Audio() 或 new Video() 来创建')
    }
    instance.type = type
    instance.url = url
    instance.name = getFileNameFromUrl(url)
    return instance
  }
  static fromFile(filepath, time = 1000 * 60 * 5){
    try {
      const tempDir = join(staticUrl, tempname)
      // 检查 temp 目录是否存在，如果不存在则创建
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      // 获取文件名
      const fileName = basename(filepath);
      // 构建目标文件的路径
      const destPath = join(tempDir, fileName);
      // 复制文件到 temp 目录
      fs.copyFileSync(filepath, destPath);
      const url = joinURL(proxyUrl, tempname, fileName)
      const t = setTimeout(() => {
        // 删除文件
        fs.unlink(destPath, (err) => {
          if (err) {
            console.error('删除文件时出错:', err);
          } else {
            console.log(`文件 ${destPath} 已删除`);
          }
        });
        clearTimeout(t)
      }, time);
      return Filebox.fromUrl(url)
    } catch (err) {
      console.error('复制文件时出错:', err);
    }
  }
  static toDownload(url, type, name){
    const instance = new Filebox()
    if(!type){
      type = Filebox.getFileType(url)
    }
    if(!name){
      name = getFileNameFromUrl(url)
    }
    instance.type = type
    instance.url = url
    instance.name = name
    return instance
  }
  toFile(dest){
    return downloadFile(this.url, dest)
  }
  static getFileType(fileName){
    const extension = fileName.split('.').pop().toLowerCase();
    // 定义文件类型对应的扩展名
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const videoExtensions = ['mp4'];
    const audioExtensions = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'wma'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar'];
    // 判断文件类型
    if (imageExtensions.includes(extension)) {
        return 'image';
    } else if (videoExtensions.includes(extension)) {
        return 'video';
    } else if (audioExtensions.includes(extension)) {
        return 'audio';
    } else if (documentExtensions.includes(extension)) {
        return 'file';
    } else {
        return 'unknown';
    }
  }
}