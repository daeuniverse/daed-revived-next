import { z } from 'zod'

export const editDNSFormSchema = z.object({
  text: z.string().min(0)
})

export const createDNSFormSchema = editDNSFormSchema.extend({
  name: z.string().min(4).max(20)
})

export const editDNSFormDefault: z.infer<typeof editDNSFormSchema> = {
  text: ''
}

export const createDNSFormDefault: z.infer<typeof createDNSFormSchema> = {
  ...editDNSFormDefault,
  name: ''
}
