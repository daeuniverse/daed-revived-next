'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
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
  useDisclosure
} from '@nextui-org/react'
import { IconCode, IconEdit, IconPlus, IconSquare, IconSquareCheck, IconTrash } from '@tabler/icons-react'
import { FC, Fragment, useEffect } from 'react'
import { Controller, SubmitHandler, UseFormReturn, useForm } from 'react-hook-form'
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
import { Modal } from '~/components/Modal'
import { RandomUnsplashImage } from '~/components/RandomUnsplashImage'
import { ResourcePage } from '~/components/ResourcePage'
import {
  createRoutingFormDefault,
  createRoutingFormSchema,
  routingFormDefault,
  routingFormSchema
} from '~/schemas/routing'

type CreateOrEditModalContentProps = {
  isOpen: boolean
  onOpenChange: () => void
  form: UseFormReturn<z.infer<typeof createRoutingFormSchema>>
  onSubmit: SubmitHandler<z.infer<typeof createRoutingFormSchema>>
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

            {type === 'create' && t('primitives.create', { resourceName: t('primitives.routing') })}
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

  routing: {
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
        <CodeBlock>{details.routing.string}</CodeBlock>
      </ModalBody>
    </ModalContent>
  </Modal>
)

const DetailsCard: FC<{
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
  const editForm = useForm<z.infer<typeof createRoutingFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(routingFormSchema),
    defaultValues: routingFormDefault
  })
  const selectMutation = useSelectRoutingMutation()
  const updateMutation = useUpdateRoutingMutation()
  const removeMutation = useRemoveRoutingMutation()

  const onEditSubmit: (id: string) => CreateOrEditModalContentProps['onSubmit'] = (id) => async (values) => {
    const { text } = values

    await updateMutation.mutateAsync({
      id,
      routing: text
    })
    await refetch()
    onEditClose()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex w-full items-center justify-between">
          <h3 className="uppercase">{details.name}</h3>

          <Button
            isIconOnly
            color={details.selected ? 'success' : 'default'}
            isLoading={selectMutation.isPending}
            isDisabled={details.selected}
            onPress={async () => {
              await selectMutation.mutateAsync({ id: details.id })
              await refetch()
            }}
          >
            {details.selected ? <IconSquareCheck /> : <IconSquare />}
          </Button>
        </div>
      </CardHeader>

      <CardBody>
        <RandomUnsplashImage sig={details.id} />
      </CardBody>

      <CardFooter className="justify-between">
        <div className="flex gap-2">
          <Button isIconOnly onPress={onDetailsOpen}>
            <IconCode />
          </Button>

          <DetailsModal details={details} isOpen={isDetailsOpen} onOpenChange={onDetailsOpenChange} />
        </div>

        <div className="flex gap-2">
          <Button
            color="secondary"
            isIconOnly
            onPress={() => {
              editForm.reset({
                text: details.routing.string
              })
              onEditOpen()
            }}
          >
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
                  <ModalHeader>{t('primitives.remove', { resourceName: t('primitives.routing') })}</ModalHeader>
                  <ModalBody>{details.name}</ModalBody>

                  <ModalFooter>
                    <Button color="secondary" isLoading={removeMutation.isPending} onPress={onRemoveClose}>
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
      </CardFooter>
    </Card>
  )
}

export default function RoutingPage() {
  const { t } = useTranslation()
  const createForm = useForm<z.infer<typeof createRoutingFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(createRoutingFormSchema),
    defaultValues: createRoutingFormDefault
  })
  const defaultRoutingIDQuery = useGetJSONStorageRequest(['defaultRoutingID'] as const)
  const listQuery = useRoutingsQuery()
  const {
    isOpen: isCreateOpen,
    onOpenChange: onCreateOpenChange,
    onOpen: onCreateOpen,
    onClose: onCreateClose
  } = useDisclosure()
  const isDefault = (id: string) => id === defaultRoutingIDQuery.data?.defaultRoutingID
  const createMutation = useCreateRoutingMutation()

  const onCreateSubmit: CreateOrEditModalContentProps['onSubmit'] = async ({ name, text }) => {
    await createMutation.mutateAsync({ name, routing: text })
    await listQuery.refetch()

    onCreateClose()
  }

  return (
    <ResourcePage
      name={t('primitives.routing')}
      creation={
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
      }
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {listQuery.data?.routings.map((details) => (
          <DetailsCard
            key={details.id}
            details={details}
            isDefault={isDefault(details.id)}
            refetch={listQuery.refetch}
          />
        ))}
      </div>
    </ResourcePage>
  )
}
