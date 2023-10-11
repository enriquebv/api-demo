import { startHttp, startHttps } from './server'

const useSsl = process.argv.includes('--ssl')

useSsl ? startHttps() : startHttp()
