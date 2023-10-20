import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
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

export const updatePasswordSchema = z.object({
  oldPassword: z.string().min(6).max(20),
  newPassword: z.string().min(6).max(20),
  confirmPassword: z.string().min(6).max(20)
})

export const useUpdatePasswordSchemaWithRefine = () => {
  const { t } = useTranslation()

  return useCallback(
    () =>
      updatePasswordSchema.refine(({ newPassword, confirmPassword }) => newPassword === confirmPassword, {
        message: t('form.errors.passwordDontMatch'),
        path: ['confirmPassword']
      }),

    [t]
  )
}

export const updatePasswordFormDefault: z.infer<typeof updatePasswordSchema> = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
}
