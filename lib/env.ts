export const REPLICACHE_LICENSE_KEY = process.env.NEXT_PUBLIC_REPLICACHE_LICENSE_KEY ?? ""
export const IS_DEV = process.env.NODE_ENV === 'development'
const wsProtocol = IS_DEV ? 'ws' : 'wss';
const httpProtocol = IS_DEV ? 'http' : 'https';
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? ""
export const API_BASE_URL = `${httpProtocol}://${BASE_URL}`
export const WS_BASE_URL = `${wsProtocol}://${BASE_URL}`