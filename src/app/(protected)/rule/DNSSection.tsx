'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Input, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@nextui-org/react'
import { IconCode, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import { FC, Fragment, useEffect } from 'react'
import { Controller, SubmitHandler, UseFormReturn, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import {
  useCreateDNSMutation,
  useRemoveDNSMutation,
  useRenameDNSMutation,
  useSelectDNSMutation,
  useUpdateDNSMutation
} from '~/apis/mutation'
import { useDNSsQuery, useGetJSONStorageRequest } from '~/apis/query'
import { Button } from '~/components/Button'
import { CodeBlock } from '~/components/CodeBlock'
import { Editor } from '~/components/Editor'
import { Modal, ModalConfirmFormFooter, ModalSubmitFormFooter } from '~/components/Modal'
import { ResourceRadio, ResourceRadioGroup } from '~/components/ResourceRadioGroup'
import { DNSFormDefault, DNSFormSchema } from '~/schemas/dns'

type CreateOrEditModalContentProps = {
  isOpen: boolean
  onOpenChange: () => void
  form: UseFormReturn<z.infer<typeof DNSFormSchema>>
  onSubmit: SubmitHandler<z.infer<typeof DNSFormSchema>>
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
    formState: { errors, dirtyFields, isSubmitting }
  } = form
  const dirty = Object.values(dirtyFields).some((dirty) => dirty)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) reset()
    }, 150)

    return () => timer && clearTimeout(timer)
  }, [reset, isOpen])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="full">
      <ModalContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ModalHeader>
            {type === 'edit' && <span>{createOrEditProps.name}</span>}

            {type === 'create' && t('primitives.create', { resourceName: t('primitives.dns') })}
          </ModalHeader>

          <ModalBody className="flex flex-col gap-4">
            <Input
              label={t('form.fields.name')}
              placeholder={t('form.fields.name')}
              isRequired
              errorMessage={errors.name?.message}
              {...register('name')}
            />

            <Controller
              name="text"
              control={control}
              render={({ field }) => (
                <Editor height="80vh" language="dae" value={field.value} onChange={field.onChange} />
              )}
            />
          </ModalBody>

          <ModalSubmitFormFooter
            reset={form.reset}
            isResetDisabled={!dirty}
            isSubmitDisabled={type === 'edit' && !dirty}
            isSubmitting={isSubmitting}
          />
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
  <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
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
}> = ({ details, isDefault }) => {
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
  const editForm = useForm<z.infer<typeof DNSFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(DNSFormSchema),
    defaultValues: DNSFormDefault
  })

  const renameMutation = useRenameDNSMutation()
  const updateMutation = useUpdateDNSMutation()
  const removeMutation = useRemoveDNSMutation()

  const onEditPress = (name: string) => {
    editForm.reset({
      name,
      text: details.dns.string
    })
    onEditOpen()
  }

  const onEditSubmit: (id: string, name: string) => CreateOrEditModalContentProps['onSubmit'] =
    (id, name) => async (values) => {
      const { text } = values

      await updateMutation.mutateAsync({
        id,
        dns: text
      })

      if (values.name !== name) {
        await renameMutation.mutateAsync({
          id,
          name: values.name
        })
      }

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
            <Button color="secondary" isIconOnly onPress={() => onEditPress(details.name)}>
              <IconEdit />
            </Button>

            <CreateOrEditModal
              type="edit"
              isOpen={isEditOpen}
              onOpenChange={onEditOpenChange}
              name={details.name}
              id={details.id}
              form={editForm}
              onSubmit={onEditSubmit(details.id, details.name)}
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

                    <ModalConfirmFormFooter
                      onCancel={onRemoveClose}
                      isSubmitting={removeMutation.isPending}
                      onConfirm={async () => {
                        await removeMutation.mutateAsync({ id: details.id })
                        onRemoveClose()
                      }}
                    />
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

export const DNSSection = () => {
  const { t } = useTranslation()
  const createForm = useForm<z.infer<typeof DNSFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(DNSFormSchema),
    defaultValues: DNSFormDefault
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

    onCreateClose()
  }

  return (
    <ResourceRadioGroup
      value={listQuery.data?.dnss.find(({ selected }) => selected)?.id || ''}
      onValueChange={async (id) => {
        await selectMutation.mutateAsync({ id })
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
        <DetailsRadio key={details.id} details={details} isDefault={isDefault(details.id)} />
      ))}
    </ResourceRadioGroup>
  )
}
