import { SetCallBackUrl } from "@/api/login.js";
import { getToken } from '@/utils/auth.js';

export const setUrl = async (callbackUrl) => {
  await SetCallBackUrl({
    callbackUrl,
    token: getToken()
  })
}