import { z } from 'zod'

export const routingFormSchema = z.object({
  text: z.string().min(1)
})

export const createRoutingFormSchema = routingFormSchema.extend({
  name: z.string().min(4).max(20)
})

export const routingFormDefault: z.infer<typeof routingFormSchema> = {
  text: `
pname(NetworkManager, systemd-resolved, dnsmasq) -> must_direct
dip(geoip:private) -> direct
dip(geoip:cn) -> direct
domain(geosite:cn) -> direct
fallback: proxy
`.trim()
}

export const createRoutingFormDefault: z.infer<typeof createRoutingFormSchema> = {
  ...routingFormDefault,
  name: ''
}
