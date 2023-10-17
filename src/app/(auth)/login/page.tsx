'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@nextui-org/react'
import ky from 'ky'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { toast } from '~/components/ui/use-toast'
import { setupFormDefault, setupFormSchema } from '~/schemas/setup'

export default function SetupPage() {
  const { t } = useTranslation()
  const router = useRouter()

  const form = useForm<z.infer<typeof setupFormSchema>>({
    resolver: zodResolver(setupFormSchema),
    defaultValues: setupFormDefault
  })

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-12 pt-20">
      <h1 className="text-center text-2xl font-bold">Welcome to daed</h1>

      <div className="flex flex-col gap-4">
        <form
          onSubmit={form.handleSubmit(async ({ endpointURL, username, password }) => {
            try {
              await ky.post('/api/login', { json: { endpointURL, username, password } }).json<{ token: string }>()

              router.replace('/orchestrate')
            } catch (err) {
              toast({ variant: 'destructive', description: (err as Error).message })
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
