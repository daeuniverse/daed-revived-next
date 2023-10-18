'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
  cn,
  useDisclosure
} from '@nextui-org/react'
import { IconCheck, IconCode, IconEdit, IconPlus } from '@tabler/icons-react'
import { Trash2Icon } from 'lucide-react'
import { FC, Fragment, useEffect, useMemo } from 'react'
import { Controller, SubmitHandler, UseFormReturn, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Config } from '~/apis/gql/graphql'
import {
  useCreateConfigMutation,
  useRemoveConfigMutation,
  useSelectConfigMutation,
  useUpdateConfigMutation
} from '~/apis/mutation'
import { useConfigsQuery, useGeneralQuery, useGetJSONStorageRequest } from '~/apis/query'
import { CodeBlock } from '~/components/CodeBlock'
import { Description } from '~/components/Description'
import { ListInput } from '~/components/ListInput'
import { Modal } from '~/components/Modal'
import { ResourcePage } from '~/components/ResourcePage'
import { TagsInputOption } from '~/components/TagsInput'
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { deriveTime } from '~/lib/time'
import {
  TLSImplementation,
  TcpCheckHttpMethod,
  UTLSImitate,
  configFormDefault,
  configFormSchema,
  createConfigFormDefault,
  createConfigFormSchema
} from '~/schemas/config'

type CreateOrEditModalContentProps = {
  isOpen: boolean
  onOpenChange: () => void
  lanInterfaces: TagsInputOption[]
  wanInterfaces: TagsInputOption[]
  form: UseFormReturn<z.infer<typeof createConfigFormSchema>>
  onSubmit: SubmitHandler<z.infer<typeof createConfigFormSchema>>
}

type CreateModalContentProps = {
  type: 'create'
}

type EditModalContentProps = {
  type: 'edit'
  name: string
  id: string
}

const CreateOrEditModalContent: FC<
  CreateOrEditModalContentProps & (CreateModalContentProps | EditModalContentProps)
> = ({ isOpen, onOpenChange, lanInterfaces, wanInterfaces, ...createOrEditProps }) => {
  const { t } = useTranslation()
  const { type, form, onSubmit } = createOrEditProps
  const {
    getValues,
    register,
    reset,
    control,
    formState: { errors }
  } = form
  const dirty = Object.values(form.formState.dirtyFields).some((dirty) => dirty)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) reset()
    }, 100)

    return () => timer && clearTimeout(timer)
  }, [reset, isOpen])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ModalHeader>
              {type === 'edit' && (
                <Fragment>
                  {createOrEditProps.name}
                  {createOrEditProps.id}
                </Fragment>
              )}

              {type === 'create' && t('primitives.create', { resourceName: t('primitives.config') })}
            </ModalHeader>

            <ModalBody className="flex flex-col gap-2">
              {type === 'create' && (
                <Input
                  label={t('form.fields.name')}
                  placeholder={t('form.fields.name')}
                  isRequired
                  errorMessage={errors.name?.message}
                  {...register('name')}
                />
              )}

              <Accordion defaultValue={['software-options']} selectionMode="multiple">
                <AccordionItem value="software-options" title={t('primitives.softwareOptions')}>
                  <div className="space-y-4 px-1">
                    <Input
                      type="number"
                      placeholder="12345"
                      label={t('form.fields.tproxyPort')}
                      description={t('form.descriptions.tproxyPort')}
                      isRequired
                      errorMessage={errors.tproxyPort?.message}
                      {...register('tproxyPort', { setValueAs: (value) => Number.parseInt(value) })}
                    />

                    <Controller
                      name="tproxyPortProtect"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <Switch isSelected={field.value} onChange={field.onChange}>
                            {t('form.fields.tproxyPortProtect')}
                          </Switch>

                          <Description>{t('form.descriptions.tproxyPortProtect')}</Description>
                        </div>
                      )}
                    />

                    <div>
                      <Input
                        type="number"
                        label={t('form.fields.soMarkFromDae')}
                        placeholder={t('form.descriptions.pleaseEnter', { fieldName: t('form.fields.soMarkFromDae') })}
                        description={t('form.descriptions.soMarkFromDae')}
                        errorMessage={errors.soMarkFromDae?.message}
                        {...register('soMarkFromDae', { setValueAs: (value) => Number.parseInt(value) })}
                      />
                    </div>

                    <Controller
                      name="logLevel"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label={t('form.fields.logLevel')}
                          selectedKeys={field.value ? [field.value] : []}
                          onChange={field.onChange}
                          disallowEmptySelection
                        >
                          {[
                            ['error', t('form.fields.logLevels.error')],
                            ['warn', t('form.fields.logLevels.warn')],
                            ['info', t('form.fields.logLevels.info')],
                            ['debug', t('form.fields.logLevels.debug')],
                            ['trace', t('form.fields.logLevels.trace')]
                          ].map(([value, label]) => (
                            <SelectItem key={value} textValue={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="disableWaitingNetwork"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <Switch isSelected={field.value} onChange={field.onChange}>
                            {t('form.fields.disableWaitingNetwork')}
                          </Switch>

                          <Description>{t('form.descriptions.disableWaitingNetwork')}</Description>
                        </div>
                      )}
                    />
                  </div>
                </AccordionItem>

                <AccordionItem value="interface-and-kernel-options" title={t('primitives.interfaceAndKernelOptions')}>
                  <div className="space-y-4 px-1">
                    <Controller
                      name="lanInterface"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label={t('form.fields.lanInterface')}
                          description={t('form.descriptions.lanInterface')}
                          selectionMode="multiple"
                          selectedKeys={field.value}
                          onSelectionChange={field.onChange}
                        >
                          {lanInterfaces.map(({ title, value, description }) => (
                            <SelectItem key={value} textValue={value}>
                              {title || value}
                              {description}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="wanInterface"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label={t('form.fields.wanInterface')}
                          description={t('form.descriptions.wanInterface')}
                          selectionMode="multiple"
                          selectedKeys={field.value}
                          onSelectionChange={field.onChange}
                        >
                          {wanInterfaces.map(({ title, value, description }) => (
                            <SelectItem key={value} textValue={value}>
                              {title || value}
                              {description}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="autoConfigKernelParameter"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <Switch isSelected={field.value} onChange={field.onChange}>
                            {t('form.fields.autoConfigKernelParameter')}
                          </Switch>

                          <Description>{t('form.descriptions.autoConfigKernelParameter')}</Description>
                        </div>
                      )}
                    />
                  </div>
                </AccordionItem>

                <AccordionItem value="node-connectivity-check" title={t('primitives.nodeConnectivityCheck')}>
                  <div className="space-y-4 px-1">
                    <Controller
                      name="tcpCheckUrl"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <FormLabel dangling>{t('form.fields.tcpCheckUrl')}</FormLabel>
                          <ListInput name={field.name} />
                          <Description>{t('form.descriptions.tcpCheckUrl')}</Description>
                        </div>
                      )}
                    />

                    <Controller
                      name="tcpCheckHttpMethod"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label={t('form.fields.tcpCheckHttpMethod')}
                          description={t('form.descriptions.tcpCheckHttpMethod')}
                          disallowEmptySelection
                          selectedKeys={field.value ? [field.value] : []}
                          onChange={field.onChange}
                        >
                          {Object.values(TcpCheckHttpMethod).map((tcpCheckHttpMethod) => (
                            <SelectItem key={tcpCheckHttpMethod} value={tcpCheckHttpMethod}>
                              {tcpCheckHttpMethod}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <FormField
                      name="udpCheckDns"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel dangling>{t('form.fields.udpCheckDns')}</FormLabel>

                          <Description>{t('form.descriptions.udpCheckDns')}</Description>

                          <FormControl>
                            <ListInput name={field.name} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Input
                      type="number"
                      label={`${t('form.fields.checkInterval')} (${t('primitives.second')})`}
                      placeholder="30"
                      errorMessage={errors.checkIntervalSeconds?.message}
                      {...register('checkIntervalSeconds', { setValueAs: (value) => Number.parseInt(value) })}
                    />

                    <Input
                      type="number"
                      label={`${t('form.fields.checkTolerance')} (${t('primitives.millisecond')})`}
                      placeholder="0"
                      description={t('form.descriptions.checkTolerance')}
                      errorMessage={errors.checkToleranceMS?.message}
                      {...register('checkToleranceMS', { setValueAs: (value) => Number.parseInt(value) })}
                    />
                  </div>
                </AccordionItem>

                <AccordionItem value="connecting-options" title={t('primitives.connectingOptions')}>
                  <div className="space-y-4 px-1">
                    <Controller
                      name="dialMode"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label={t('form.fields.dialMode')}
                          selectedKeys={field.value ? [field.value] : []}
                          onChange={field.onChange}
                          disallowEmptySelection
                        >
                          {['ip', 'domain', 'domain+', 'domain++'].map((value) => (
                            <SelectItem key={value} textValue={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="allowInsecure"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <Switch isSelected={field.value} onChange={field.onChange}>
                            {t('form.fields.allowInsecure')}
                          </Switch>

                          <Description>{t('form.descriptions.allowInsecure')}</Description>
                        </div>
                      )}
                    />

                    <Input
                      type="number"
                      label={`${t('form.fields.sniffingTimeout')} (${t('primitives.millisecond')})`}
                      description={t('form.descriptions.sniffingTimeout')}
                      placeholder={t('form.descriptions.pleaseEnter', { fieldName: t('form.fields.sniffingTimeout') })}
                      {...register('sniffingTimeoutMS', { setValueAs: (value) => Number.parseInt(value) })}
                    />

                    <Controller
                      name="tlsImplementation"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label={t('form.fields.tlsImplementation')}
                          description={t('form.descriptions.tlsImplementation')}
                          selectedKeys={field.value ? [field.value] : []}
                          onChange={field.onChange}
                          disallowEmptySelection
                        >
                          {Object.values(TLSImplementation).map((tlsImplementation) => (
                            <SelectItem key={tlsImplementation} value={tlsImplementation}>
                              {tlsImplementation}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    {getValues().tlsImplementation === TLSImplementation.utls && (
                      <Controller
                        name="utlsImitate"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label={t('form.fields.utlsImitate')}
                            description={t('form.descriptions.utlsImitate')}
                            selectedKeys={field.value ? [field.value] : []}
                            onChange={field.onChange}
                          >
                            {Object.values(UTLSImitate).map((utlsImitate) => (
                              <SelectItem key={utlsImitate} value={utlsImitate}>
                                {utlsImitate}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                      />
                    )}
                  </div>
                </AccordionItem>
              </Accordion>
            </ModalBody>

            <ModalFooter>
              <Button type="reset" color="secondary" isDisabled={!dirty} onPress={() => form.reset()}>
                {t('actions.reset')}
              </Button>

              <Button type="submit" isDisabled={type === 'edit' && !dirty} isLoading={form.formState.isSubmitting}>
                {t('actions.submit')}
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  )
}

const DetailsModal: FC<{
  config: Config
  isOpen: boolean
  onOpenChange: () => void
}> = ({ config, isOpen, onOpenChange }) => (
  <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
    <ModalContent>
      <ModalHeader>{config.id}</ModalHeader>

      <ModalBody>
        <CodeBlock language="json">{JSON.stringify(config, null, 2)}</CodeBlock>
      </ModalBody>
    </ModalContent>
  </Modal>
)

const DetailsCard: FC<{
  details: Config
  isDefault?: boolean
  refetch: () => Promise<unknown>
  lanInterfaces: TagsInputOption[]
  wanInterfaces: TagsInputOption[]
}> = ({ details, isDefault, refetch, lanInterfaces, wanInterfaces }) => {
  const { t } = useTranslation()
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onOpenChange: onDetailsOpenChange } = useDisclosure()
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
    onOpenChange: onEditOpenChange
  } = useDisclosure()
  const editForm = useForm<z.infer<typeof createConfigFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(configFormSchema),
    defaultValues: configFormDefault
  })
  const selectMutation = useSelectConfigMutation()
  const updateMutation = useUpdateConfigMutation()
  const removeMutation = useRemoveConfigMutation()

  const onEditSubmit: (id: string) => CreateOrEditModalContentProps['onSubmit'] = (id) => async (values) => {
    const { checkIntervalSeconds, checkToleranceMS, sniffingTimeoutMS, ...global } = values

    await updateMutation.mutateAsync({
      id,
      global: {
        ...global,
        checkInterval: `${checkIntervalSeconds}s`,
        checkTolerance: `${checkToleranceMS}ms`,
        sniffingTimeout: `${sniffingTimeoutMS}ms`
      }
    })
    await refetch()
    onEditClose()
  }

  return (
    <Card className={cn(details.selected && 'border-primary')}>
      <CardHeader>
        <div className="flex w-full items-center justify-between">
          <h3>{details.name}</h3>

          {!isDefault && (
            <Button isIconOnly color="success" onPress={() => selectMutation.mutate({ id: details.id })}>
              <IconCheck />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardBody>{details.id}</CardBody>

      <CardFooter className="gap-2">
        <Button isIconOnly onPress={onDetailsOpen}>
          <IconCode />
        </Button>

        <DetailsModal config={details} isOpen={isDetailsOpen} onOpenChange={onDetailsOpenChange} />

        <Button
          color="secondary"
          isIconOnly
          onPress={() => {
            editForm.reset({
              ...details.global,
              checkIntervalSeconds: deriveTime(details.global.checkInterval, 's'),
              sniffingTimeoutMS: deriveTime(details.global.sniffingTimeout, 'ms'),
              checkToleranceMS: deriveTime(details.global.checkTolerance, 'ms')
            })
            onEditOpen()
          }}
        >
          <IconEdit />
        </Button>

        <CreateOrEditModalContent
          type="edit"
          isOpen={isEditOpen}
          onOpenChange={onEditOpenChange}
          name={details.name}
          id={details.id}
          lanInterfaces={lanInterfaces}
          wanInterfaces={wanInterfaces}
          form={editForm}
          onSubmit={onEditSubmit(details.id)}
        />

        {!isDefault && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button color="danger" isDisabled={details.selected} isIconOnly>
                <Trash2Icon className="w-4" />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('primitives.remove', { resourceName: t('primitives.config') })}</AlertDialogTitle>

                <AlertDialogDescription>{details.name}</AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    isLoading={removeMutation.isPending}
                    onPress={async () => {
                      await removeMutation.mutateAsync({ id: details.id })
                      await refetch()
                    }}
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
  )
}

export default function ConfigPage() {
  const { t } = useTranslation()
  const createForm = useForm<z.infer<typeof createConfigFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(createConfigFormSchema),
    defaultValues: createConfigFormDefault
  })
  const defaultConfigIDQuery = useGetJSONStorageRequest(['defaultConfigID'] as const)
  const isDefault = (id: string) => id === defaultConfigIDQuery.data?.defaultConfigID
  const generalQuery = useGeneralQuery()
  const listQuery = useConfigsQuery()
  const {
    isOpen: isCreateOpen,
    onOpenChange: onCreateOpenChange,
    onOpen: onCreateOpen,
    onClose: onCreateClose
  } = useDisclosure()

  const createMutation = useCreateConfigMutation()

  const onCreateSubmit: CreateOrEditModalContentProps['onSubmit'] = async (values) => {
    const { name, checkIntervalSeconds, checkToleranceMS, sniffingTimeoutMS, ...global } = values

    await createMutation.mutateAsync({
      name,
      global: {
        ...global,
        checkInterval: `${checkIntervalSeconds}s`,
        checkTolerance: `${checkToleranceMS}ms`,
        sniffingTimeout: `${sniffingTimeoutMS}ms`
      }
    })
    await listQuery.refetch()
    onCreateClose()
  }

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
    <ResourcePage
      name={t('primitives.config')}
      creation={
        <Fragment>
          <Button color="primary" isIconOnly onPress={onCreateOpen}>
            <IconPlus />
          </Button>

          <CreateOrEditModalContent
            isOpen={isCreateOpen}
            onOpenChange={onCreateOpenChange}
            type="create"
            lanInterfaces={lanInterfaces}
            wanInterfaces={wanInterfaces}
            form={createForm}
            onSubmit={onCreateSubmit}
          />
        </Fragment>
      }
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {listQuery.data?.configs.map((config, index) => (
          <DetailsCard
            key={index}
            details={config}
            isDefault={isDefault(config.id)}
            refetch={listQuery.refetch}
            lanInterfaces={lanInterfaces}
            wanInterfaces={wanInterfaces}
          />
        ))}
      </div>
    </ResourcePage>
  )
}
