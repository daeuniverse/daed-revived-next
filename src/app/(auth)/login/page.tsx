'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import ky from 'ky'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
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
        <Form {...form}>
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
            <FormField
              name="endpointURL"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.fields.endpointURL')}</FormLabel>

                  <FormDescription>
                    {t('form.descriptions.pleaseEnter', {
                      fieldName: t('form.fields.endpointURL')
                    })}
                  </FormDescription>

                  <FormControl>
                    <Input type="url" placeholder="http://127.0.0.1:2023/graphql" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.fields.username')}</FormLabel>

                  <FormDescription>
                    {t('form.descriptions.pleaseEnter', {
                      fieldName: t('form.fields.username')
                    })}
                  </FormDescription>

                  <FormControl>
                    <Input type="text" placeholder="daed" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.fields.password')}</FormLabel>

                  <FormDescription>
                    {t('form.descriptions.pleaseEnter', {
                      fieldName: t('form.fields.password')
                    })}
                  </FormDescription>

                  <FormControl>
                    <Input type="password" placeholder="daeuniverse" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" type="submit" loading={form.formState.isSubmitting}>
              {t('actions.login')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
