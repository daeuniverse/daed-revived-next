import { z } from 'zod'

export const setupFormSchema = z.object({
  endpointURL: z.string().url().nonempty(),
  username: z.string().min(4).max(20),
  password: z.string().min(6).max(20)
})

export const setupFormDefault: z.infer<typeof setupFormSchema> = {
  endpointURL: '',
  username: '',
  password: ''
}
