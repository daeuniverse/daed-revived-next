'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@nextui-org/react'
import RiveComponent from '@rive-app/react-canvas'
import ky from 'ky'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'
import { loginFormDefault, loginSchema } from '~/schemas/login'

export default function LoginPage() {
  const { t } = useTranslation()
  const router = useRouter()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: loginFormDefault
  })

  return (
    <div className="container mx-auto grid w-full grid-cols-6 gap-12 pt-20">
      <div className="col-span-4">
        <RiveComponent src="/569-6666-blue-planet.riv" />
      </div>

      <div className="col-span-2 flex flex-col gap-4">
        <form
          onSubmit={form.handleSubmit(async ({ endpointURL, username, password }) => {
            try {
              await ky.post('/api/login', { json: { endpointURL, username, password } }).json<{ token: string }>()

              router.replace('/orchestrate')
            } catch (err) {
              toast.error((err as Error).message)
            }
          })}
        >
          <Input
            type="url"
            label={t('form.fields.endpointURL')}
            placeholder="http://127.0.0.1:2023/graphql"
            description={t('form.descriptions.pleaseEnter', { fieldName: t('form.fields.endpointURL') })}
            isRequired
            errorMessage={form.formState.errors.endpointURL?.message}
            {...form.register('endpointURL')}
          />

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
