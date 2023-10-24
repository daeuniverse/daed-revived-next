import { z } from 'zod'
import { Policy } from '~/apis/gql/graphql'

export const groupFormSchema = z.object({
  name: z.string().min(4).max(20),
  policy: z.nativeEnum(Policy)
})

export const groupFormDefault: z.infer<typeof groupFormSchema> = {
  name: '',
  policy: Policy.MinMovingAvg
}
