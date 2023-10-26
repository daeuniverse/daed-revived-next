'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@nextui-org/react'
import RiveComponent from '@rive-app/react-canvas'
import ky, { HTTPError } from 'ky'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'
import { LogoText } from '~/components/LogoText'
import { loginFormDefault, loginSchema } from '~/schemas/account'

export default function LoginPage() {
  const { t } = useTranslation()
  const router = useRouter()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: loginFormDefault
  })

  return (
    <div className="absolute left-1/2 top-1/2 flex w-full max-w-screen-xl -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 px-4 sm:flex-row">
      <div className="flex w-full flex-col items-center sm:w-2/5">
        <div className="overflow-hidden rounded-lg">
          <RiveComponent src="/809-1634-rocket-demo.riv" className="h-64 w-64" />
        </div>

        <LogoText />
      </div>

      <div className="flex w-full flex-col gap-2 sm:flex-1">
        <form
          onSubmit={form.handleSubmit(async ({ username, password }) => {
            try {
              await ky.post('/api/login', { json: { username, password } }).json<{ token: string }>()

              router.replace('/network')
            } catch (err) {
              toast.error((await (err as HTTPError).response.json()).message)
            }
          })}
        >
          <Input
            type="text"
            label={t('form.fields.username')}
            placeholder="daed"
            description={t('form.descriptions.pleaseEnter', { fieldName: t('form.fields.username') })}
            isRequired
            errorMessage={form.formState.errors.username?.message}
            {...form.register('username')}
          />

          <Input
            type="password"
            label={t('form.fields.password')}
            placeholder="daeuniverse"
            description={t('form.descriptions.pleaseEnter', { fieldName: t('form.fields.password') })}
            isRequired
            errorMessage={form.formState.errors.password?.message}
            {...form.register('password')}
          />

          <Button type="submit" color="primary" isLoading={form.formState.isSubmitting}>
            {t('actions.login')}
          </Button>
        </form>
      </div>
    </div>
  )
}
