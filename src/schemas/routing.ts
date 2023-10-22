import { z } from 'zod'

export const routingFormSchema = z.object({
  name: z.string().min(4).max(20),
  text: z.string().min(1)
})

export const routingFormDefault: z.infer<typeof routingFormSchema> = {
  name: '',
  text: `
pname(NetworkManager, systemd-resolved, dnsmasq) -> must_direct
dip(geoip:private) -> direct
dip(geoip:cn) -> direct
domain(geosite:cn) -> direct
fallback: proxy
`.trim()
}
