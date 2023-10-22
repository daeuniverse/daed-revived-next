import { z } from 'zod'

export const nodeFormSchema = z.object({
  nodes: z
    .array(
      z.object({
        tag: z.string().min(1),
        link: z.string().min(1)
      })
    )
    .min(1)
})

export const nodeFormDefault: z.infer<typeof nodeFormSchema> = {
  nodes: [{ tag: '', link: '' }]
}
