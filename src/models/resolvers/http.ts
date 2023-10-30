import { z } from 'zod'
import { NodeType } from '~/constants'
import { BaseNodeResolver } from '~/models'
import { GenerateURLParams } from '~/models/base'
import { httpDefault, httpSchema } from '~/schemas/node'

export class HTTPNodeResolver extends BaseNodeResolver<typeof httpSchema> {
  type = NodeType.http
  schema = httpSchema
  defaultValues = httpDefault

  generate = (values: z.infer<typeof httpSchema> & { protocol: 'http' | 'https' }) => {
    const generateURLParams: GenerateURLParams = {
      protocol: values.protocol,
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
