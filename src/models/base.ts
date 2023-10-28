import URI from 'urijs'
import { ZodSchema, z } from 'zod'

import { NodeType } from '~/constants'

export type GenerateURLParams = {
  username?: string
  password?: string
  protocol: string
  host: string
  port: number
  params?: Record<string, unknown>
  hash: string
  path?: string
}

export abstract class BaseNodeResolver<Schema extends ZodSchema> {
  abstract type: NodeType
  abstract schema: Schema
  abstract defaultValues: z.infer<Schema>

  abstract generate(values: z.infer<Schema>): string
  abstract resolve(url: string): z.infer<Schema>

  generateURL = ({ username, password, protocol, host, port, params, hash, path }: GenerateURLParams) =>
    URI()
      .protocol(protocol || 'http')
      .username(username || '')
      .password(password || '')
      .host(host || '')
      .port(String(port) || '80')
      .path(path || '')
      .query(params || {})
      .hash(hash || '')
      .toString()

  parseURL(u: string) {
    let url = u
    let protocol = ''
    let fakeProto = false

    if (url.indexOf('://') === -1) {
      url = 'http://' + url
    } else {
      protocol = url.substring(0, url.indexOf('://'))

      switch (protocol) {
        case 'http':
        case 'https':
        case 'ws':
        case 'wss':
          break
        default:
          url = 'http' + url.substring(url.indexOf('://'))
          fakeProto = true
      }
    }

    const a = document.createElement('a')
    a.href = url

    const r: Record<string, any> = {
      source: u,
      username: a.username,
      password: a.password,
      protocol: fakeProto ? protocol : a.protocol.replace(':', ''),
      host: a.hostname,
      port: a.port ? parseInt(a.port) : protocol === 'https' || protocol === 'wss' ? 443 : 80,
      query: a.search,
      params: (function () {
        const ret: Record<string, any> = {},
          seg = a.search.replace(/^\?/, '').split('&'),
          len = seg.length

        let i = 0

        let s

        for (; i < len; i++) {
          if (!seg[i]) {
            continue
          }

          s = seg[i].split('=')
          ret[s[0]] = decodeURIComponent(s[1])
        }

        return ret
      })(),
      file: (a.pathname.match(/\/([^/?#]+)$/i) || [null, ''])[1],
      hash: a.hash.replace('#', ''),
      path: a.pathname.replace(/^([^/])/, '/$1'),
      relative: (a.href.match(/tps?:\/\/[^/]+(.+)/) || [null, ''])[1],
      segments: a.pathname.replace(/^\//, '').split('/')
    }

    a.remove()

    return r
  }
}
