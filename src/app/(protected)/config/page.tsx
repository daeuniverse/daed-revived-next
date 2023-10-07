'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CodeIcon, EditIcon, PlayIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { FC, Fragment, useMemo, useState } from 'react'
import { SubmitHandler, UseFormReturn, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import {
  useCreateConfigMutation,
  useRemoveConfigMutation,
  useSelectConfigMutation,
  useUpdateConfigMutation
} from '~/apis/mutation'
import { useConfigsQuery, useGeneralQuery, useGetJSONStorageRequest } from '~/apis/query'
import { CodeBlock } from '~/components/CodeBlock'
import { ListInput } from '~/components/ListInput'
import { TagsInput, TagsInputOption } from '~/components/TagsInput'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { deriveTime } from '~/lib/time'
import { cn } from '~/lib/ui'
import {
  TLSImplementation,
  TcpCheckHttpMethod,
  UTLSImitate,
  createConfigFormDefault,
  createConfigFormSchema,
  editConfigFormDefault,
  editConfigFormSchema
} from '~/schemas/config'

type ConfigDialogContentProps = {
  lanInterfaces: TagsInputOption[]
  wanInterfaces: TagsInputOption[]
}

type CreateConfigDialogContentProps = {
  type: 'create'
  form: UseFormReturn<z.infer<typeof createConfigFormSchema>>
  onSubmit: SubmitHandler<z.infer<typeof createConfigFormSchema>>
}

type EditConfigDialogContentProps = {
  type: 'edit'
  name: string
  id: string
  form: UseFormReturn<z.infer<typeof editConfigFormSchema>>
  onSubmit: SubmitHandler<z.infer<typeof editConfigFormSchema>>
}

const ConfigDialogContent: FC<
  ConfigDialogContentProps & (CreateConfigDialogContentProps | EditConfigDialogContentProps)
> = ({ lanInterfaces, wanInterfaces, ...createOrEditProps }) => {
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
              return onSubmit(values as z.infer<typeof createConfigFormSchema>)
            } else if (type === 'edit') {
              return onSubmit(values as z.infer<typeof editConfigFormSchema>)
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
                    resourceName: t('primitives.config')
                  })}
                </DialogTitle>
              </Fragment>
            )}
          </DialogHeader>

          <DialogBody>
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

            <Accordion type="multiple" defaultValue={['software-options']}>
              <AccordionItem value="software-options">
                <AccordionTrigger>{t('primitives.softwareOptions')}</AccordionTrigger>

                <AccordionContent>
                  <div className="space-y-4">
                    <FormField
                      name="tproxyPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.fields.tproxyPort')}</FormLabel>

                          <FormDescription>{t('form.descriptions.tproxyPort')}</FormDescription>

                          <FormControl>
                            <Input
                              type="number"
                              placeholder="12345"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value || '0'))}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="tproxyPortProtect"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.fields.tproxyPortProtect')}</FormLabel>

                          <FormDescription>{t('form.descriptions.tproxyPortProtect')}</FormDescription>

                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="soMarkFromDae"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.fields.soMarkFromDae')}</FormLabel>

                          <FormDescription>{t('form.descriptions.soMarkFromDae')}</FormDescription>

                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value || '0'))}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="logLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.fields.logLevel')}</FormLabel>

                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              <SelectItem value="error">{t('form.fields.logLevels.error')}</SelectItem>
                              <SelectItem value="warn">{t('form.fields.logLevels.warn')}</SelectItem>
                              <SelectItem value="info">{t('form.fields.logLevels.info')}</SelectItem>
                              <SelectItem value="debug">{t('form.fields.logLevels.debug')}</SelectItem>
                              <SelectItem value="trace">{t('form.fields.logLevels.trace')}</SelectItem>
                            </SelectContent>
                          </Select>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="disableWaitingNetwork"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.fields.disableWaitingNetwork')}</FormLabel>

                          <FormDescription>{t('form.descriptions.disableWaitingNetwork')}</FormDescription>

                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="interface-and-kernel-options">
                <AccordionTrigger>{t('primitives.interfaceAndKernelOptions')}</AccordionTrigger>

                <AccordionContent>
                  <div className="space-y-4">
                    <FormField
                      name="lanInterface"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.fields.lanInterface')}</FormLabel>

                          <FormDescription>{t('form.descriptions.lanInterface')}</FormDescription>

                          <FormControl>
                            <TagsInput options={lanInterfaces} {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="wanInterface"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.fields.wanInterface')}</FormLabel>

                          <FormDescription>{t('form.descriptions.wanInterface')}</FormDescription>

                          <FormControl>
                            <TagsInput options={wanInterfaces} {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="autoConfigKernelParameter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.fields.autoConfigKernelParameter')}</FormLabel>

                          <FormDescription>{t('form.descriptions.autoConfigKernelParameter')}</FormDescription>

                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="node-connectivity-check">
                <AccordionTrigger>{t('primitives.nodeConnectivityCheck')}</AccordionTrigger>

                <AccordionContent>
                  <div className="space-y-4">
                    <FormField
                      name="tcpCheckUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.fields.tcpCheckUrl')}</FormLabel>

                          <FormDescription>{t('form.descriptions.tcpCheckUrl')}</FormDescription>

                          <FormControl>
                            <ListInput name={field.name} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="tcpCheckHttpMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.fields.tcpCheckHttpMethod')}</FormLabel>

                          <FormDescription>{t('form.descriptions.tcpCheckHttpMethod')}</FormDescription>

                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              {Object.values(TcpCheckHttpMethod).map((tcpCheckHttpMethod) => (
                                <SelectItem key={tcpCheckHttpMethod} value={tcpCheckHttpMethod}>
                                  {tcpCheckHttpMethod}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="udpCheckDns"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.fields.udpCheckDns')}</FormLabel>

                          <FormDescription>{t('form.descriptions.udpCheckDns')}</FormDescription>

                          <FormControl>
                            <ListInput name={field.name} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="checkIntervalSeconds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('form.fields.checkInterval')} ({t('primitives.second')})
                          </FormLabel>

                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value || '0'))}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="checkToleranceMS"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('form.fields.checkTolerance')} ({t('primitives.millisecond')})
                          </FormLabel>

                          <FormDescription>{t('form.descriptions.checkTolerance')}</FormDescription>

                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value || '0'))}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="connectiing-options">
                <AccordionTrigger>{t('primitives.connectingOptions')}</AccordionTrigger>

                <AccordionContent>
                  <div className="space-y-4">
                    <FormField
                      name="dialMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.fields.dialMode')}</FormLabel>

                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              <SelectItem value="ip">ip</SelectItem>
                              <SelectItem value="domain">domain</SelectItem>
                              <SelectItem value="domain+">domain+</SelectItem>
                              <SelectItem value="domain++">domain++</SelectItem>
                            </SelectContent>
                          </Select>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="allowInsecure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.fields.allowInsecure')}</FormLabel>

                          <FormDescription>{t('form.descriptions.allowInsecure')}</FormDescription>

                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="sniffingTimeoutMS"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('form.fields.sniffingTimeout')} ({t('primitives.millisecond')})
                          </FormLabel>

                          <FormDescription>{t('form.descriptions.sniffingTimeout')}</FormDescription>

                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value || '0'))}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="tlsImplementation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.fields.tlsImplementation')}</FormLabel>

                          <FormDescription>{t('form.descriptions.tlsImplementation')}</FormDescription>

                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              {Object.values(TLSImplementation).map((tlsImplementation) => (
                                <SelectItem key={tlsImplementation} value={tlsImplementation}>
                                  {tlsImplementation}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.getValues().tlsImplementation === TLSImplementation.utls && (
                      <FormField
                        name="utlsImitate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.fields.utlsImitate')}</FormLabel>

                            <FormDescription>{t('form.descriptions.utlsImitate')}</FormDescription>

                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>

                              <SelectContent>
                                <ScrollArea className="h-64">
                                  {Object.values(UTLSImitate).map((utlsImitate) => (
                                    <SelectItem key={utlsImitate} value={utlsImitate}>
                                      {utlsImitate}
                                    </SelectItem>
                                  ))}
                                </ScrollArea>
                              </SelectContent>
                            </Select>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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

export default function ConfigPage() {
  const { t } = useTranslation()
  const createForm = useForm<z.infer<typeof createConfigFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(createConfigFormSchema),
    defaultValues: createConfigFormDefault
  })
  const editForm = useForm<z.infer<typeof editConfigFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(editConfigFormSchema),
    defaultValues: editConfigFormDefault
  })
  const defaultConfigIdQuery = useGetJSONStorageRequest(['defaultConfigID'] as const)
  const generalQuery = useGeneralQuery()
  const configsQuery = useConfigsQuery()
  const isDefault = (id: string) => id === defaultConfigIdQuery.data?.defaultConfigID
  const [createDialogOpened, setCreateDialogOpened] = useState(false)
  const [editDialogOpened, setEditDialogOpened] = useState(false)
  const selectConfigMutation = useSelectConfigMutation()
  const createConfigMutation = useCreateConfigMutation()
  const updateConfigMutation = useUpdateConfigMutation()
  const removeConfigMutation = useRemoveConfigMutation()

  const lanInterfaces: TagsInputOption[] = useMemo(() => {
    const interfaces = generalQuery.data?.general.interfaces

    if (!interfaces) return []

    return interfaces.map(({ name, ip }) => ({
      label: name,
      value: name,
      description: (
        <div className="flex flex-col gap-1">
          {ip.map((addr, i) => (
            <span key={i}>{addr}</span>
          ))}
        </div>
      )
    }))
  }, [generalQuery.data?.general.interfaces])

  const wanInterfaces: TagsInputOption[] = useMemo(() => {
    const interfaces = generalQuery.data?.general.interfaces

    if (!interfaces) return []

    return [
      { title: t('primitives.autoDetect'), value: 'auto' },
      ...interfaces
        .filter(({ flag }) => !!flag.default)
        .map(({ name, ip }) => ({
          title: name,
          value: name,
          description: (
            <div className="flex flex-col gap-1">
              {ip.map((addr, i) => (
                <span key={i}>{addr}</span>
              ))}
            </div>
          )
        }))
    ]
  }, [generalQuery.data?.general.interfaces, t])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg">Configs</h2>

        <Dialog open={createDialogOpened} onOpenChange={setCreateDialogOpened}>
          <DialogTrigger asChild>
            <Button size="icon" icon={<PlusIcon className="w-4" />} />
          </DialogTrigger>

          <ConfigDialogContent
            type="create"
            lanInterfaces={lanInterfaces}
            wanInterfaces={wanInterfaces}
            form={createForm}
            onSubmit={async (values) => {
              const { name, checkIntervalSeconds, checkToleranceMS, sniffingTimeoutMS, ...global } = values

              await createConfigMutation.mutateAsync({
                name,
                global: {
                  ...global,
                  checkInterval: `${checkIntervalSeconds}s`,
                  checkTolerance: `${checkToleranceMS}ms`,
                  sniffingTimeout: `${sniffingTimeoutMS}ms`
                }
              })
              await configsQuery.refetch()
              setCreateDialogOpened(false)
            }}
          />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {configsQuery.data?.configs.map((config, index) => (
          <Card key={index} className={cn(config.selected && 'border-primary')}>
            <CardHeader>
              <CardTitle className="uppercase">{config.name}</CardTitle>

              {isDefault(config.id) && (
                <CardDescription>
                  <Badge className="uppercase">{t('primitives.default')}</Badge>
                </CardDescription>
              )}
            </CardHeader>

            <CardContent>{config.id}</CardContent>

            <CardFooter className="gap-2">
              {!config.selected && (
                <Button
                  size="icon"
                  loading={selectConfigMutation.isLoading}
                  onClick={() => selectConfigMutation.mutate({ id: config.id })}
                  icon={<PlayIcon className="w-4" />}
                />
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon" icon={<CodeIcon className="w-4" />} />
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="uppercase">{config.name}</DialogTitle>
                  </DialogHeader>

                  <DialogBody>
                    <CodeBlock language="json">{JSON.stringify(config, null, 2)}</CodeBlock>
                  </DialogBody>
                </DialogContent>
              </Dialog>

              <Dialog
                open={editDialogOpened}
                onOpenChange={(opened) => {
                  if (opened) {
                    editForm.reset({
                      ...config.global,
                      checkIntervalSeconds: deriveTime(config.global.checkInterval, 's'),
                      sniffingTimeoutMS: deriveTime(config.global.sniffingTimeout, 'ms'),
                      checkToleranceMS: deriveTime(config.global.checkTolerance, 'ms')
                    })
                  }

                  setEditDialogOpened(opened)
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="secondary" size="icon" icon={<EditIcon className="w-4" />} />
                </DialogTrigger>

                <ConfigDialogContent
                  type="edit"
                  name={config.name}
                  id={config.id}
                  lanInterfaces={lanInterfaces}
                  wanInterfaces={wanInterfaces}
                  form={editForm}
                  onSubmit={async (values) => {
                    const { checkIntervalSeconds, checkToleranceMS, sniffingTimeoutMS, ...global } = values

                    await updateConfigMutation.mutateAsync({
                      id: config.id,
                      global: {
                        ...global,
                        checkInterval: `${checkIntervalSeconds}s`,
                        checkTolerance: `${checkToleranceMS}ms`,
                        sniffingTimeout: `${sniffingTimeoutMS}ms`
                      }
                    })
                    await configsQuery.refetch()
                    setEditDialogOpened(false)
                  }}
                />
              </Dialog>

              {!isDefault(config.id) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      icon={<Trash2Icon className="w-4" />}
                      disabled={config.selected}
                    />
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>hello world</AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button
                          onClick={async () => {
                            await removeConfigMutation.mutateAsync({ id: config.id })
                            await configsQuery.refetch()
                          }}
                          loading={removeConfigMutation.isLoading}
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
    </div>
  )
}
