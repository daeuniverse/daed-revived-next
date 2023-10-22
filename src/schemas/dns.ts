import { z } from 'zod'

export const DNSFormSchema = z.object({
  name: z.string().min(4).max(20),
  text: z.string().min(1)
})

export const DNSFormDefault: z.infer<typeof DNSFormSchema> = {
  name: '',
  text: `
upstream {
  alidns: 'udp://223.5.5.5:53'
  googledns: 'tcp+udp://8.8.8.8:53'
}

routing {
  request {
    qname(geosite:cn) -> alidns
    fallback: googledns
  }
}
`.trim()
}
