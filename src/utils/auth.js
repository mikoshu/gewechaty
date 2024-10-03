import DS from 'ds';

let ds = new DS()

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