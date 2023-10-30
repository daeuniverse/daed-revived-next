import { z } from 'zod'
import { NodeType } from '~/constants'
import { BaseNodeResolver } from '~/models'
import { v2rayDefault, v2raySchema } from '~/schemas/node'

export class VlessNodeResolver extends BaseNodeResolver<typeof v2raySchema> {
  type = NodeType.vless
  schema = v2raySchema
  defaultValues = v2rayDefault

  generate(values: z.infer<typeof v2raySchema>) {
    const { net, tls, path, host, type, sni, flow, allowInsecure, alpn, id, add, port, ps } = values

    const params: Record<string, unknown> = {
      type: net,
      security: tls,
      path,
      host,
      headerType: type,
      sni,
      flow,
      allowInsecure
    }

    if (alpn !== '') params.alpn = alpn

    if (net === 'grpc') params.serviceName = path

    if (net === 'kcp') params.seed = path

    return this.generateURL({
      protocol: 'vless',
      username: id,
      host: add,
      port,
      hash: ps,
      params
    })
  }

  resolve(url: string) {
    const u = this.parseURL(url)

    const o: z.infer<typeof v2raySchema> = {
      ps: decodeURIComponent(u.hash),
      add: u.host,
      port: u.port,
      id: decodeURIComponent(u.username),
      net: u.params.type || 'tcp',
      type: u.params.headerType || 'none',
      host: u.params.host || u.params.sni || '',
      path: u.params.path || u.params.serviceName || '',
      alpn: u.params.alpn || '',
      flow: u.params.flow || 'none',
      sni: u.params.sni || '',
      tls: u.params.security || 'none',
      allowInsecure: u.params.allowInsecure || false,
      aid: 0,
      scy: 'none',
      v: ''
    }

    if (o.alpn !== '') {
      o.alpn = decodeURIComponent(o.alpn)
    }

    if (o.net === 'kcp') {
      o.path = u.params.seed
    }

    return o
  }
}
