import { Base64 } from 'js-base64'
import { z } from 'zod'
import { NodeType } from '~/constants'
import { BaseNodeResolver } from '~/models'
import { v2rayDefault, v2raySchema } from '~/schemas/node'

export class VmessNodeResolver extends BaseNodeResolver<typeof v2raySchema> {
  type = NodeType.vmess
  schema = v2raySchema
  defaultValues = v2rayDefault

  generate(values: z.infer<typeof v2raySchema>) {
    const { net } = values
    const body: Record<string, unknown> = structuredClone(values)

    switch (net) {
      case 'kcp':
      case 'tcp':
      default:
        body.type = ''
    }

    switch (body.net) {
      case 'ws':
      case 'h2':
      case 'grpc':
      case 'kcp':
      default:
        if (body.net === 'tcp' && body.type === 'http') {
          break
        }

        body.path = ''
    }

    if (!(body.protocol === 'vless' && body.tls === 'xtls')) {
      delete body.flow
    }

    return 'vmess://' + Base64.encode(JSON.stringify(body))
  }

  resolve(url: string) {
    const values = JSON.parse(Base64.decode(url.substring(url.indexOf('://') + 3)))

    values.ps = decodeURIComponent(values.ps)
    values.tls = values.tls || 'none'
    values.type = values.type || 'none'
    values.scy = values.scy || 'auto'

    return values
  }
}
