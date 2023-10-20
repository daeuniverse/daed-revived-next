'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Input, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react'
import { IconCode, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import { FC, Fragment, useEffect } from 'react'
import { Controller, SubmitHandler, UseFormReturn, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useCreateDNSMutation, useRemoveDNSMutation, useSelectDNSMutation, useUpdateDNSMutation } from '~/apis/mutation'
import { useDNSsQuery, useGetJSONStorageRequest } from '~/apis/query'
import { Button } from '~/components/Button'
import { CodeBlock } from '~/components/CodeBlock'
import { Editor } from '~/components/Editor'
import { Modal } from '~/components/Modal'
import { ResourceRadio, ResourceRadioGroup } from '~/components/ResourceRadioGroup'
import { DNSFormDefault, DNSFormSchema, createDNSFormDefault, createDNSFormSchema } from '~/schemas/dns'

type CreateOrEditModalContentProps = {
  isOpen: boolean
  onOpenChange: () => void
  form: UseFormReturn<z.infer<typeof createDNSFormSchema>>
  onSubmit: SubmitHandler<z.infer<typeof createDNSFormSchema>>
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
  ...createOrEditProps
}) => {
  const { t } = useTranslation()
  const { type, form, onSubmit } = createOrEditProps
  const {
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ModalHeader>
            {type === 'edit' && <span className="uppercase">{createOrEditProps.name}</span>}

            {type === 'create' && t('primitives.create', { resourceName: t('primitives.dns') })}
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

            <Controller
              name="text"
              control={control}
              render={({ field }) => (
                <Editor height="60vh" language="dae" value={field.value} onChange={field.onChange} />
              )}
            />
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
      </ModalContent>
    </Modal>
  )
}

type Details = {
  id: string
  name: string
  selected: boolean

  dns: {
    string: string
  }
}

const DetailsModal: FC<{
  details: Details
  isOpen: boolean
  onOpenChange: () => void
}> = ({ details, isOpen, onOpenChange }) => (
  <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
    <ModalContent>
      <ModalHeader>{details.id}</ModalHeader>

      <ModalBody>
        <CodeBlock>{details.dns.string}</CodeBlock>
      </ModalBody>
    </ModalContent>
  </Modal>
)

const DetailsRadio: FC<{
  details: Details
  isDefault?: boolean
  refetch: () => Promise<unknown>
}> = ({ details, isDefault, refetch }) => {
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
  const editForm = useForm<z.infer<typeof createDNSFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(DNSFormSchema),
    defaultValues: DNSFormDefault
  })
  const updateMutation = useUpdateDNSMutation()
  const removeMutation = useRemoveDNSMutation()

  const onEditPress = () => {
    editForm.reset({
      text: details.dns.string
    })
    onEditOpen()
  }

  const onEditSubmit: (id: string) => CreateOrEditModalContentProps['onSubmit'] = (id) => async (values) => {
    const { text } = values

    await updateMutation.mutateAsync({
      id,
      dns: text
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
                    <ModalHeader>{t('primitives.remove', { resourceName: t('primitives.dns') })}</ModalHeader>
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

export default function DNS() {
  const { t } = useTranslation()
  const createForm = useForm<z.infer<typeof createDNSFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(createDNSFormSchema),
    defaultValues: createDNSFormDefault
  })
  const defaultDNSIDQuery = useGetJSONStorageRequest(['defaultDNSID'] as const)
  const listQuery = useDNSsQuery()
  const {
    isOpen: isCreateOpen,
    onOpenChange: onCreateOpenChange,
    onOpen: onCreateOpen,
    onClose: onCreateClose
  } = useDisclosure()
  const isDefault = (id: string) => id === defaultDNSIDQuery.data?.defaultDNSID

  const createMutation = useCreateDNSMutation()
  const selectMutation = useSelectDNSMutation()

  const onCreateSubmit: CreateOrEditModalContentProps['onSubmit'] = async ({ name, text }) => {
    await createMutation.mutateAsync({ name, dns: text })
    await listQuery.refetch()

    onCreateClose()
  }

  return (
    <ResourceRadioGroup
      value={listQuery.data?.dnss.find(({ selected }) => selected)?.id || ''}
      onValueChange={async (id) => {
        await selectMutation.mutateAsync({ id })
        await listQuery.refetch()
      }}
      label={
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{t('primitives.dns')}</h2>

          <Fragment>
            <Button color="primary" isIconOnly onPress={onCreateOpen}>
              <IconPlus />
            </Button>

            <CreateOrEditModal
              isOpen={isCreateOpen}
              onOpenChange={onCreateOpenChange}
              type="create"
              form={createForm}
              onSubmit={onCreateSubmit}
            />
          </Fragment>
        </div>
      }
    >
      {listQuery.data?.dnss.map((details) => (
        <DetailsRadio
          key={details.id}
          details={details}
          isDefault={isDefault(details.id)}
          refetch={listQuery.refetch}
        />
      ))}
    </ResourceRadioGroup>
  )
}
