import { z } from 'zod'

export const editRoutingFormSchema = z.object({
  text: z.string().min(0)
})

export const createRoutingFormSchema = editRoutingFormSchema.extend({
  name: z.string().min(4).max(20)
})

export const editRoutingFormDefault: z.infer<typeof editRoutingFormSchema> = {
  text: `
pname(NetworkManager, systemd-resolved, dnsmasq) -> must_direct
dip(geoip:private) -> direct
dip(geoip:cn) -> direct
domain(geosite:cn) -> direct
fallback: proxy
`.trim()
}

export const createRoutingFormDefault: z.infer<typeof createRoutingFormSchema> = {
  ...editRoutingFormDefault,
  name: ''
}
