import {post} from '@/request/request'

export const downloadFile = (data, config) => {
  return post('/message/downloadImage', data, config)
}

