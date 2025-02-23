import DS from 'ds';
import { join } from 'node:path';

let ds;

export const createDS = (data_dir) => {
  const ds_path = join(data_dir, 'ds.json')
  ds = new DS(ds_path)
}

export const getToken = () => {
  return ds.token || ''
}

export const setToken = (token) => {
  ds.token = token
  ds.save()
}

export const getAppId = () => {
  return ds.appid || ''
}

export const setAppId = (appid) => {
  ds.appid = appid
  ds.save()
}

export const getUuid = () => {
  return ds.uuid || ''
}

export const setUuid = (uuid) => {
  ds.uuid = uuid
  ds.save()
}


export const setBaseUrl = (baseUrl) => {
  ds.baseUrl = baseUrl
  ds.save()
}

export const getBaseUrl = () => {
  return ds.baseUrl || ''
}

export const setFileApiUrl = (fileBaseUrl) => {
  ds.fileApiBaseUrl = fileBaseUrl
  ds.save()
}

export const getFileApiUrl = () => {
  return ds.fileApiBaseUrl || ''
}