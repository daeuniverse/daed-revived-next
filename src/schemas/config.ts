import { z } from 'zod'

export const editConfigFormSchema = z.object({
  tproxyPort: z.number().min(0).max(65535).positive(),
  tproxyPortProtect: z.boolean(),
  soMarkFromDae: z.number().min(0),
  logLevel: z.string(),
  disableWaitingNetwork: z.boolean(),
  lanInterface: z.array(z.string().nonempty()),
  wanInterface: z.array(z.string().nonempty()),
  autoConfigKernelParameter: z.boolean(),
  tcpCheckUrl: z.array(z.string().nonempty()).nonempty(),
  tcpCheckHttpMethod: z.string(),
  udpCheckDns: z.array(z.string().nonempty()).nonempty(),
  checkIntervalSeconds: z.number().min(0),
  checkToleranceMS: z.number().min(0),
  dialMode: z.string(),
  allowInsecure: z.boolean(),
  sniffingTimeoutMS: z.number().min(0),
  tlsImplementation: z.string(),
  utlsImitate: z.string()
})

export const createConfigFormSchema = editConfigFormSchema.extend({
  name: z.string().nonempty().max(20)
})

export enum LogLevel {
  error = 'error',
  warn = 'warn',
  info = 'info',
  debug = 'debug',
  trace = 'trace'
}

export enum DialMode {
  ip = 'ip',
  domain = 'domain',
  domainP = 'domain+',
  domainPP = 'domain++'
}

export enum TcpCheckHttpMethod {
  CONNECT = 'CONNECT',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  TRACE = 'TRACE',
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  PUT = 'PUT'
}

export enum TLSImplementation {
  tls = 'tls',
  utls = 'utls'
}

export enum UTLSImitate {
  randomized = 'randomized',
  randomizedalpn = 'randomizedalpn',
  randomizednoalpn = 'randomizednoalpn',
  firefox_auto = 'firefox_auto',
  firefox_55 = 'firefox_55',
  firefox_56 = 'firefox_56',
  firefox_63 = 'firefox_63',
  firefox_65 = 'firefox_65',
  firefox_99 = 'firefox_99',
  firefox_102 = 'firefox_102',
  firefox_105 = 'firefox_105',
  chrome_auto = 'chrome_auto',
  chrome_58 = 'chrome_58',
  chrome_62 = 'chrome_62',
  chrome_70 = 'chrome_70',
  chrome_72 = 'chrome_72',
  chrome_83 = 'chrome_83',
  chrome_87 = 'chrome_87',
  chrome_96 = 'chrome_96',
  chrome_100 = 'chrome_100',
  chrome_102 = 'chrome_102',
  ios_auto = 'ios_auto',
  ios_11_1 = 'ios_11_1',
  ios_12_1 = 'ios_12_1',
  ios_13 = 'ios_13',
  ios_14 = 'ios_14',
  android_11_okhttp = 'android_11_okhttp',
  edge_auto = 'edge_auto',
  edge_85 = 'edge_85',
  edge_106 = 'edge_106',
  safari_auto = 'safari_auto',
  safari_16_0 = 'safari_16_0',
  utls_360_auto = '360_auto',
  utls_360_7_5 = '360_7_5',
  utls_360_11_0 = '360_11_0',
  qq_auto = 'qq_auto',
  qq_11_1 = 'qq_11_1'
}

export const editConfigFormDefault: z.infer<typeof editConfigFormSchema> = {
  tproxyPort: 12345,
  tproxyPortProtect: true,
  soMarkFromDae: 80,
  logLevel: LogLevel.info,
  disableWaitingNetwork: true,
  lanInterface: [],
  wanInterface: [],
  autoConfigKernelParameter: true,
  tcpCheckUrl: ['http://cp.cloudflare.com', '1.1.1.1', '2606:4700:4700::1111'],
  tcpCheckHttpMethod: TcpCheckHttpMethod.HEAD,
  udpCheckDns: ['dns.google.com:53', '8.8.8.8', '2001:4860:4860::8888'],
  checkIntervalSeconds: 30,
  checkToleranceMS: 0,
  dialMode: DialMode.domain,
  allowInsecure: false,
  sniffingTimeoutMS: 100,
  tlsImplementation: TLSImplementation.tls,
  utlsImitate: UTLSImitate.randomized
}

export const createConfigFormDefault: z.infer<typeof createConfigFormSchema> = {
  name: '',
  ...editConfigFormDefault
}
