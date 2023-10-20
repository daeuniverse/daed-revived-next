import { z } from 'zod'
import { Policy } from '~/apis/gql/graphql'

export const groupFormSchema = z.object({
  policy: z.nativeEnum(Policy)
})

export const createGroupFormSchema = groupFormSchema.extend({
  name: z.string().min(4).max(20)
})

export const groupFormDefault: z.infer<typeof groupFormSchema> = {
  policy: Policy.MinMovingAvg
}

export const createGroupFormDefault: z.infer<typeof createGroupFormSchema> = {
  ...groupFormDefault,
  name: ''
}
