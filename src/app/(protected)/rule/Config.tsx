'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Accordion,
  AccordionItem,
  Input,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  SelectItemProps,
  Switch,
  useDisclosure
} from '@nextui-org/react'
import { IconCode, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import { FC, Fragment, useEffect, useMemo } from 'react'
import { Controller, FormProvider, SubmitHandler, UseFormReturn, useForm } from 'react-hook-form'
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
import { Button } from '~/components/Button'
import { CodeBlock } from '~/components/CodeBlock'
import { Description } from '~/components/Description'
import { Label } from '~/components/Label'
import { ListInput } from '~/components/ListInput'
import { Modal } from '~/components/Modal'
import { ResourceRadio, ResourceRadioGroup } from '~/components/ResourceRadioGroup'
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
  lanInterfaces: SelectItemProps[]
  wanInterfaces: SelectItemProps[]
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

const CreateOrEditModal: FC<CreateOrEditModalContentProps & (CreateModalContentProps | EditModalContentProps)> = ({
  isOpen,
  onOpenChange,
  lanInterfaces,
  wanInterfaces,
  ...createOrEditProps
}) => {
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
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ModalHeader>
              {type === 'edit' && <span>{createOrEditProps.name}</span>}

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

              <Accordion defaultExpandedKeys={['software-options']} selectionMode="multiple">
                <AccordionItem key="software-options" title={t('primitives.softwareOptions')}>
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

                <AccordionItem key="interface-and-kernel-options" title={t('primitives.interfaceAndKernelOptions')}>
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
                          onSelectionChange={(value) =>
                            field.onChange(
                              value === 'all' ? lanInterfaces.map(({ value }) => value) : Array.from(value)
                            )
                          }
                        >
                          {lanInterfaces.map(({ key, title, value, description }) => (
                            <SelectItem key={key} value={value} description={description}>
                              {title || value}
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
                          onSelectionChange={(value) =>
                            field.onChange(
                              value === 'all' ? wanInterfaces.map(({ value }) => value) : Array.from(value)
                            )
                          }
                        >
                          {wanInterfaces.map(({ key, title, value, description }) => (
                            <SelectItem key={key} value={value} description={description}>
                              {title || value}
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

                <AccordionItem key="node-connectivity-check" title={t('primitives.nodeConnectivityCheck')}>
                  <div className="space-y-4 px-1">
                    <Controller
                      name="tcpCheckUrl"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-col gap-2">
                          <Label>{t('form.fields.tcpCheckUrl')}</Label>

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

                    <Controller
                      name="udpCheckDns"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-col gap-2">
                          <Label>{t('form.fields.udpCheckDns')}</Label>

                          <Description>{t('form.descriptions.udpCheckDns')}</Description>

                          <ListInput name={field.name} />
                        </div>
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

                <AccordionItem key="connecting-options" title={t('primitives.connectingOptions')}>
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
        </FormProvider>
      </ModalContent>
    </Modal>
  )
}

const DetailsModal: FC<{
  details: Config
  isOpen: boolean
  onOpenChange: () => void
}> = ({ details, isOpen, onOpenChange }) => (
  <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
    <ModalContent>
      <ModalHeader>{details.id}</ModalHeader>

      <ModalBody>
        <CodeBlock language="json">{JSON.stringify(details, null, 2)}</CodeBlock>
      </ModalBody>
    </ModalContent>
  </Modal>
)

const DetailsRadio: FC<{
  details: Config
  isDefault?: boolean
  refetch: () => Promise<unknown>
  lanInterfaces: SelectItemProps[]
  wanInterfaces: SelectItemProps[]
}> = ({ details, isDefault, refetch, lanInterfaces, wanInterfaces }) => {
  const { t } = useTranslation()
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onOpenChange: onDetailsOpenChange } = useDisclosure()
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
    onOpenChange: onEditOpenChange
  } = useDisclosure()
  const {
    isOpen: isRemoveOpen,
    onOpen: onRemoveOpen,
    onClose: onRemoveClose,
    onOpenChange: onRemoveOpenChange
  } = useDisclosure()
  const editForm = useForm<z.infer<typeof createConfigFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(configFormSchema),
    defaultValues: configFormDefault
  })
  const updateMutation = useUpdateConfigMutation()
  const removeMutation = useRemoveConfigMutation()

  const onEditPress = () => {
    editForm.reset({
      ...details.global,
      checkIntervalSeconds: deriveTime(details.global.checkInterval, 's'),
      sniffingTimeoutMS: deriveTime(details.global.sniffingTimeout, 'ms'),
      checkToleranceMS: deriveTime(details.global.checkTolerance, 'ms')
    })
    onEditOpen()
  }

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
    <ResourceRadio
      key={details.id}
      value={details.id}
      description={
        <div className="flex gap-2">
          <Button isIconOnly onPress={onDetailsOpen}>
            <IconCode />
          </Button>

          <DetailsModal details={details} isOpen={isDetailsOpen} onOpenChange={onDetailsOpenChange} />

          <div className="flex gap-2">
            <Button color="secondary" isIconOnly onPress={onEditPress}>
              <IconEdit />
            </Button>

            <CreateOrEditModal
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
              <Fragment>
                <Button color="danger" isIconOnly isDisabled={details.selected} onPress={onRemoveOpen}>
                  <IconTrash />
                </Button>

                <Modal isOpen={isRemoveOpen} onOpenChange={onRemoveOpenChange}>
                  <ModalContent>
                    <ModalHeader>{t('primitives.remove', { resourceName: t('primitives.config') })}</ModalHeader>
                    <ModalBody>{details.name}</ModalBody>

                    <ModalFooter>
                      <Button color="secondary" onPress={onRemoveClose}>
                        {t('actions.cancel')}
                      </Button>

                      <Button
                        color="danger"
                        isLoading={removeMutation.isPending}
                        onPress={async () => {
                          await removeMutation.mutateAsync({ id: details.id })
                          await refetch()
                          onRemoveClose()
                        }}
                      >
                        {t('actions.confirm')}
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              </Fragment>
            )}
          </div>
        </div>
      }
    >
      {details.name}
    </ResourceRadio>
  )
}

export default function Config() {
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
  const selectMutation = useSelectConfigMutation()

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

  const lanInterfaces: SelectItemProps[] = useMemo(() => {
    const interfaces = generalQuery.data?.general.interfaces

    if (!interfaces) return []

    return interfaces.map(({ name, ip }) => ({
      key: name,
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

  const wanInterfaces: SelectItemProps[] = useMemo(() => {
    const interfaces = generalQuery.data?.general.interfaces

    if (!interfaces) return []

    return [
      { key: 'auto-detect', title: t('primitives.autoDetect'), value: 'auto' },
      ...interfaces
        .filter(({ flag }) => !!flag.default)
        .map(({ name, ip }) => ({
          key: name,
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
    ]
  }, [generalQuery.data?.general.interfaces, t])

  return (
    <ResourceRadioGroup
      value={listQuery.data?.configs.find(({ selected }) => selected)?.id || ''}
      onValueChange={async (id) => {
        await selectMutation.mutateAsync({ id })
        await listQuery.refetch()
      }}
      label={
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{t('primitives.config')}</h2>

          <Fragment>
            <Button color="primary" isIconOnly onPress={onCreateOpen}>
              <IconPlus />
            </Button>

            <CreateOrEditModal
              isOpen={isCreateOpen}
              onOpenChange={onCreateOpenChange}
              type="create"
              lanInterfaces={lanInterfaces}
              wanInterfaces={wanInterfaces}
              form={createForm}
              onSubmit={onCreateSubmit}
            />
          </Fragment>
        </div>
      }
    >
      {listQuery.data?.configs.map((details) => (
        <DetailsRadio
          key={details.id}
          details={details}
          isDefault={isDefault(details.id)}
          refetch={listQuery.refetch}
          lanInterfaces={lanInterfaces}
          wanInterfaces={wanInterfaces}
        />
      ))}
    </ResourceRadioGroup>
  )
}
