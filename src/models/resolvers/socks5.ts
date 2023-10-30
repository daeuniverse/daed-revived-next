import { z } from 'zod'
import { NodeType } from '~/constants'
import { BaseNodeResolver } from '~/models'
import { GenerateURLParams } from '~/models/base'
import { socks5Default, socks5Schema } from '~/schemas/node'

export class Socks5NodeResolver extends BaseNodeResolver<typeof socks5Schema> {
  type = NodeType.socks5
  schema = socks5Schema
  defaultValues = socks5Default

  generate = (values: z.infer<typeof socks5Schema>) => {
    const generateURLParams: GenerateURLParams = {
      protocol: 'socks5',
      host: values.host,
      port: values.port,
      hash: values.name
    }

    if (values.username && values.password) {
      Object.assign(generateURLParams, {
        username: values.username,
        password: values.password
      })
    }

    return this.generateURL(generateURLParams)
  }

  resolve(url: string) {
    const u = this.parseURL(url)

    return {
      username: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      host: u.host,
      port: u.port,
      protocol: u.protocol,
      name: decodeURIComponent(u.hash)
    }
  }
}
