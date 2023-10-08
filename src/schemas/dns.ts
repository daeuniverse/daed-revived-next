import { z } from 'zod'

export const editDNSFormSchema = z.object({
  text: z.string().min(0)
})

export const createDNSFormSchema = editDNSFormSchema.extend({
  name: z.string().min(4).max(20)
})

export const editDNSFormDefault: z.infer<typeof editDNSFormSchema> = {
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

export const createDNSFormDefault: z.infer<typeof createDNSFormSchema> = {
  ...editDNSFormDefault,
  name: ''
}
