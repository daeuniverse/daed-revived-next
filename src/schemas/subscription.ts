import { z } from 'zod'

export const subscriptionFormSchema = z.object({
  subscriptions: z
    .array(
      z.object({
        tag: z.string().min(1),
        link: z.string().min(1)
      })
    )
    .min(1)
})

export const subscriptionFormDefault: z.infer<typeof subscriptionFormSchema> = {
  subscriptions: [{ tag: '', link: '' }]
}
