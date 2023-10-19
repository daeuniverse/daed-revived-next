import { z } from 'zod'

export const loginSchema = z.object({
  endpointURL: z.string().url().min(1),
  username: z.string().min(4).max(20),
  password: z.string().min(6).max(20)
})

export const loginFormDefault: z.infer<typeof loginSchema> = {
  endpointURL: '',
  username: '',
  password: ''
}
