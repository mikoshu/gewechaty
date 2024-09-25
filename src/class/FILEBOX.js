import {downloadFile} from '@/request/fileRequest.js'
import {getFileNameFromUrl} from '@/utils/index.js'

export class Filebox {
  constructor() {
    this.url = ''
    this.type = ''
    this.name = ''
  }
  static fromUrl(url){
    const instance = new Filebox()
    const supportType = ['image', 'file']
    const type = Filebox.getFileType(url)
    if(!supportType.includes(type)){
      throw new Error('Filebox只支持图片和文件类型，语音和视频使用 new Audio() 或 new Video() 来创建')
    }
    instance.type = type
    instance.url = url
    instance.name = getFileNameFromUrl(url)
    return instance
  }
  static toDownload(url){
    const instance = new Filebox()
    const type = Filebox.getFileType(url)
    instance.type = type
    instance.url = url
    instance.name = getFileNameFromUrl(url)
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