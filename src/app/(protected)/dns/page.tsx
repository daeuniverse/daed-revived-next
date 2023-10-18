'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CodeIcon, EditIcon, PlayIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { FC, Fragment, useState } from 'react'
import { SubmitHandler, UseFormReturn, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useCreateDNSMutation, useRemoveDNSMutation, useSelectDNSMutation, useUpdateDNSMutation } from '~/apis/mutation'
import { useDNSsQuery, useGetJSONStorageRequest } from '~/apis/query'
import { CodeBlock } from '~/components/CodeBlock'
import { Editor } from '~/components/Editor'
import { ResourcePage } from '~/components/ResourcePage'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '~/components/ui/alert-dialog'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib/ui'
import { createDNSFormDefault, createDNSFormSchema, editDNSFormDefault, editDNSFormSchema } from '~/schemas/dns'

type CreateDialogContentProps = {
  type: 'create'
  form: UseFormReturn<z.infer<typeof createDNSFormSchema>>
  onSubmit: SubmitHandler<z.infer<typeof createDNSFormSchema>>
}

type EditDialogContentProps = {
  type: 'edit'
  name: string
  id: string
  form: UseFormReturn<z.infer<typeof editDNSFormSchema>>
  onSubmit: SubmitHandler<z.infer<typeof editDNSFormSchema>>
}

const CreateOrEditDialogContent: FC<CreateDialogContentProps | EditDialogContentProps> = ({ ...createOrEditProps }) => {
  const { t } = useTranslation()
  const { type, form, onSubmit } = createOrEditProps
  const dirty = Object.values(form.formState.dirtyFields).some((dirty) => dirty)

  return (
    <DialogContent size="medium">
      {/* @ts-expect-error */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => {
            // just to make typescript happy
            if (type === 'create') {
              return onSubmit(values as z.infer<typeof createDNSFormSchema>)
            } else if (type === 'edit') {
              return onSubmit(values as z.infer<typeof editDNSFormSchema>)
            }
          })}
        >
          <DialogHeader>
            {type === 'edit' && (
              <Fragment>
                <DialogTitle className="uppercase">{createOrEditProps.name}</DialogTitle>
                <DialogDescription>{createOrEditProps.id}</DialogDescription>
              </Fragment>
            )}

            {type === 'create' && (
              <Fragment>
                <DialogTitle className="uppercase">
                  {t('primitives.create', {
                    resourceName: t('primitives.dns')
                  })}
                </DialogTitle>
              </Fragment>
            )}
          </DialogHeader>

          <DialogBody className="flex flex-col gap-2">
            {type === 'create' && (
              <FormField
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.fields.name')}</FormLabel>

                    <FormControl>
                      <Input {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Editor height="60vh" language="dae" value={field.value} onChange={field.onChange} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </DialogBody>

          <DialogFooter>
            <Button type="reset" variant="secondary" disabled={!dirty} onClick={() => form.reset()}>
              {t('actions.reset')}
            </Button>

            <Button type="submit" disabled={type === 'edit' && !dirty} loading={form.formState.isSubmitting}>
              {t('actions.submit')}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}

export default function DNSPage() {
  const { t } = useTranslation()
  const createForm = useForm<z.infer<typeof createDNSFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(createDNSFormSchema),
    defaultValues: createDNSFormDefault
  })
  const editForm = useForm<z.infer<typeof editDNSFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(editDNSFormSchema),
    defaultValues: editDNSFormDefault
  })
  const defaultDNSIDQuery = useGetJSONStorageRequest(['defaultDNSID'] as const)
  const listQuery = useDNSsQuery()
  const isDefault = (id: string) => id === defaultDNSIDQuery.data?.defaultDNSID
  const [createDialogOpened, setCreateDialogOpened] = useState(false)
  const [editDialogOpened, setEditDialogOpened] = useState(false)
  const selectMutation = useSelectDNSMutation()
  const createMutation = useCreateDNSMutation()
  const updateMutation = useUpdateDNSMutation()
  const removeMutation = useRemoveDNSMutation()

  const onCreateSubmit: CreateDialogContentProps['onSubmit'] = async ({ name, text }) => {
    await createMutation.mutateAsync({ name, dns: text })
    await listQuery.refetch()

    setCreateDialogOpened(false)
  }

  const onEditSubmit: (id: string) => EditDialogContentProps['onSubmit'] = (id) => async (values) => {
    const { text } = values

    await updateMutation.mutateAsync({
      id,
      dns: text
    })
    await listQuery.refetch()
    setEditDialogOpened(false)
  }

  return (
    <ResourcePage
      name={t('primitives.dns')}
      creation={
        <Dialog open={createDialogOpened} onOpenChange={setCreateDialogOpened}>
          <DialogTrigger asChild>
            <Button size="icon" icon={<PlusIcon />} />
          </DialogTrigger>

          <CreateOrEditDialogContent type="create" form={createForm} onSubmit={onCreateSubmit} />
        </Dialog>
      }
    >
      <div className="grid grid-cols-1 gap-2">
        {listQuery.data?.dnss.map((dns, index) => (
          <Card key={index} className={cn(dns.selected && 'border-primary')}>
            <CardHeader>
              <CardTitle className="uppercase">{dns.name}</CardTitle>

              {isDefault(dns.id) && (
                <CardDescription>
                  <Badge className="uppercase">{t('primitives.default')}</Badge>
                </CardDescription>
              )}
            </CardHeader>

            <CardContent>{dns.id}</CardContent>

            <CardFooter className="gap-2">
              {!dns.selected && (
                <Button
                  size="icon"
                  loading={selectMutation.isLoading}
                  onClick={() => selectMutation.mutate({ id: dns.id })}
                  icon={<PlayIcon className="w-4" />}
                />
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon" icon={<CodeIcon className="w-4" />} />
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="uppercase">{dns.name}</DialogTitle>
                  </DialogHeader>

                  <DialogBody>
                    <CodeBlock>{dns.dns.string}</CodeBlock>
                  </DialogBody>
                </DialogContent>
              </Dialog>

              <Dialog
                open={editDialogOpened}
                onOpenChange={(opened) => {
                  if (opened) {
                    editForm.reset({
                      text: dns.dns.string
                    })
                  }

                  setEditDialogOpened(opened)
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="secondary" size="icon" icon={<EditIcon className="w-4" />} />
                </DialogTrigger>

                <CreateOrEditDialogContent
                  type="edit"
                  name={dns.name}
                  id={dns.id}
                  form={editForm}
                  onSubmit={onEditSubmit(dns.id)}
                />
              </Dialog>

              {!isDefault(dns.id) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      icon={<Trash2Icon className="w-4" />}
                      disabled={dns.selected}
                    />
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t('primitives.remove', { resourceName: t('primitives.details') })}
                      </AlertDialogTitle>

                      <AlertDialogDescription>{dns.name}</AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button
                          onClick={async () => {
                            await removeMutation.mutateAsync({ id: dns.id })
                            await listQuery.refetch()
                          }}
                          loading={removeMutation.isLoading}
                        >
                          {t('actions.confirm')}
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </ResourcePage>
  )
}
