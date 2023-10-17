'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CodeIcon, EditIcon, PlayIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { FC, Fragment, useState } from 'react'
import { SubmitHandler, UseFormReturn, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import {
  useCreateRoutingMutation,
  useRemoveRoutingMutation,
  useSelectRoutingMutation,
  useUpdateRoutingMutation
} from '~/apis/mutation'
import { useGetJSONStorageRequest, useRoutingsQuery } from '~/apis/query'
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
import {
  createRoutingFormDefault,
  createRoutingFormSchema,
  editRoutingFormDefault,
  editRoutingFormSchema
} from '~/schemas/routing'

type CreateDialogContentProps = {
  type: 'create'
  form: UseFormReturn<z.infer<typeof createRoutingFormSchema>>
  onSubmit: SubmitHandler<z.infer<typeof createRoutingFormSchema>>
}

type EditDialogContentProps = {
  type: 'edit'
  name: string
  id: string
  form: UseFormReturn<z.infer<typeof editRoutingFormSchema>>
  onSubmit: SubmitHandler<z.infer<typeof editRoutingFormSchema>>
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
              return onSubmit(values as z.infer<typeof createRoutingFormSchema>)
            } else if (type === 'edit') {
              return onSubmit(values as z.infer<typeof editRoutingFormSchema>)
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
                    resourceName: t('primitives.routing')
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

export default function RoutingPage() {
  const { t } = useTranslation()
  const createForm = useForm<z.infer<typeof createRoutingFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(createRoutingFormSchema),
    defaultValues: createRoutingFormDefault
  })
  const editForm = useForm<z.infer<typeof editRoutingFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(editRoutingFormSchema),
    defaultValues: editRoutingFormDefault
  })
  const defaultRoutingIDQuery = useGetJSONStorageRequest(['defaultRoutingID'] as const)
  const listQuery = useRoutingsQuery()
  const isDefault = (id: string) => id === defaultRoutingIDQuery.data?.defaultRoutingID
  const [createDialogOpened, setCreateDialogOpened] = useState(false)
  const [editDialogOpened, setEditDialogOpened] = useState(false)
  const selectMutation = useSelectRoutingMutation()
  const createMutation = useCreateRoutingMutation()
  const updateMutation = useUpdateRoutingMutation()
  const removeMutation = useRemoveRoutingMutation()

  const onCreateSubmit: CreateDialogContentProps['onSubmit'] = async ({ name, text }) => {
    await createMutation.mutateAsync({ name, routing: text })
    await listQuery.refetch()

    setCreateDialogOpened(false)
  }

  const onEditSubmit: (id: string) => EditDialogContentProps['onSubmit'] = (id) => async (values) => {
    const { text } = values

    await updateMutation.mutateAsync({
      id,
      routing: text
    })
    await listQuery.refetch()
    setEditDialogOpened(false)
  }

  return (
    <ResourcePage
      name={t('primitives.routing')}
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
        {listQuery.data?.routings.map((routing, index) => (
          <Card key={index} className={cn(routing.selected && 'border-primary')}>
            <CardHeader>
              <CardTitle className="uppercase">{routing.name}</CardTitle>

              {isDefault(routing.id) && (
                <CardDescription>
                  <Badge className="uppercase">{t('primitives.default')}</Badge>
                </CardDescription>
              )}
            </CardHeader>

            <CardContent>{routing.id}</CardContent>

            <CardFooter className="gap-2">
              {!routing.selected && (
                <Button
                  size="icon"
                  loading={selectMutation.isLoading}
                  onClick={() => selectMutation.mutate({ id: routing.id })}
                  icon={<PlayIcon className="w-4" />}
                />
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon" icon={<CodeIcon className="w-4" />} />
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="uppercase">{routing.name}</DialogTitle>
                  </DialogHeader>

                  <DialogBody>
                    <CodeBlock>{routing.routing.string}</CodeBlock>
                  </DialogBody>
                </DialogContent>
              </Dialog>

              <Dialog
                open={editDialogOpened}
                onOpenChange={(opened) => {
                  if (opened) {
                    editForm.reset({
                      text: routing.routing.string
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
                  name={routing.name}
                  id={routing.id}
                  form={editForm}
                  onSubmit={onEditSubmit(routing.id)}
                />
              </Dialog>

              {!isDefault(routing.id) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      icon={<Trash2Icon className="w-4" />}
                      disabled={routing.selected}
                    />
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t('primitives.remove', { resourceName: t('primitives.config') })}
                      </AlertDialogTitle>

                      <AlertDialogDescription>{routing.name}</AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button
                          onClick={async () => {
                            await removeMutation.mutateAsync({ id: routing.id })
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
