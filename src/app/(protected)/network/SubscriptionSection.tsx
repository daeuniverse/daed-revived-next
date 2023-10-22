import { zodResolver } from '@hookform/resolvers/zod'
import {
  Accordion,
  AccordionItem,
  getKeyValue,
  Input,
  ModalBody,
  ModalContent,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure
} from '@nextui-org/react'
import { IconPlus, IconRefresh, IconTrash, IconUpload } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { FC, Fragment, useEffect, useMemo } from 'react'
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import {
  useImportSubscriptionsMutation,
  useRemoveSubscriptionsMutation,
  useUpdateSubscriptionsMutation
} from '~/apis/mutation'
import { Button } from '~/components/Button'
import { Modal, ModalConfirmFormFooter, ModalSubmitFormFooter } from '~/components/Modal'
import { subscriptionFormDefault, subscriptionFormSchema } from '~/schemas/subscription'
import { Node, Subscription } from './typings'

const SubscriptionNodeTable: FC<{
  nodes: Node[]
  isLoading?: boolean
}> = ({ nodes, isLoading }) => {
  const { t } = useTranslation()

  const nodesTableColumns = useMemo(
    () => [
      { key: 'name', name: t('primitives.name') },
      { key: 'protocol', name: t('primitives.protocol') },
      { key: 'address', name: t('primitives.address') }
    ],
    [t]
  )

  return (
    <Table isCompact aria-label="nodes">
      <TableHeader columns={nodesTableColumns}>
        {(column) => <TableColumn key={column.key}>{column.name}</TableColumn>}
      </TableHeader>

      <TableBody items={nodes} isLoading={isLoading}>
        {(item) => (
          <TableRow key={item.name}>{(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}</TableRow>
        )}
      </TableBody>
    </Table>
  )
}

const ImportSubscriptionInputList: FC<{ name: string }> = ({ name }) => {
  const { t } = useTranslation()
  const { fields, append, remove } = useFieldArray({ name })

  return (
    <div className="flex flex-col gap-2">
      {fields.map((item, index) => (
        <div key={item.id} className="flex items-start gap-2">
          <Controller
            name={`${name}.${index}.tag`}
            render={({ field, fieldState }) => (
              <Input
                className="w-1/3"
                label={t('form.fields.tag')}
                placeholder={t('form.fields.tag')}
                errorMessage={fieldState.error?.message}
                isRequired
                {...field}
              />
            )}
          />

          <Controller
            name={`${name}.${index}.link`}
            render={({ field, fieldState }) => (
              <Input
                label={t('form.fields.link')}
                placeholder={t('form.fields.link')}
                errorMessage={fieldState.error?.message}
                isRequired
                {...field}
              />
            )}
          />

          <Button color="danger" isIconOnly onPress={() => remove(index)}>
            <IconTrash />
          </Button>
        </div>
      ))}

      <div className="self-end">
        <Button color="primary" onPress={() => append({ tag: '', link: '' })} isIconOnly>
          <IconPlus />
        </Button>
      </div>
    </div>
  )
}

export const SubscriptionSection: FC<{ subscriptions: Subscription[] }> = ({ subscriptions }) => {
  const { t } = useTranslation()

  const {
    isOpen: isImportSubscriptionOpen,
    onOpen: onImportSubscriptionOpen,
    onClose: onImportSubscriptionClose,
    onOpenChange: onImportSubscriptionOpenChange
  } = useDisclosure()

  const importSubscriptionForm = useForm<z.infer<typeof subscriptionFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: subscriptionFormDefault
  })

  const {
    isOpen: isRemoveSubscriptionOpen,
    onOpen: onRemoveSubscriptionOpen,
    onClose: onRemoveSubscriptionClose,
    onOpenChange: onRemoveSubscriptionOpenChange
  } = useDisclosure()

  const importSubscriptionsMutation = useImportSubscriptionsMutation()
  const removeSubscriptionsMutation = useRemoveSubscriptionsMutation()
  const updateSubscriptionsMutation = useUpdateSubscriptionsMutation()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isImportSubscriptionOpen) importSubscriptionForm.reset()
    }, 150)

    return () => timer && clearTimeout(timer)
  }, [importSubscriptionForm, isImportSubscriptionOpen])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{t('primitives.subscription')}</h3>

        <Button color="primary" isIconOnly onPress={onImportSubscriptionOpen}>
          <IconUpload />
        </Button>

        <Modal isOpen={isImportSubscriptionOpen} onOpenChange={onImportSubscriptionOpenChange}>
          <FormProvider {...importSubscriptionForm}>
            <form
              onSubmit={importSubscriptionForm.handleSubmit(async (values) => {
                await importSubscriptionsMutation.mutateAsync(values.subscriptions)

                onImportSubscriptionClose()
              })}
            >
              <ModalContent>
                <ModalHeader>{t('primitives.subscription')}</ModalHeader>

                <ModalBody>
                  <ImportSubscriptionInputList name="subscriptions" />
                </ModalBody>

                <ModalSubmitFormFooter
                  reset={importSubscriptionForm.reset}
                  isSubmitting={importSubscriptionsMutation.isPending}
                />
              </ModalContent>
            </form>
          </FormProvider>
        </Modal>
      </div>

      <Accordion selectionMode="multiple" variant="shadow" isCompact>
        {subscriptions.map((subscription) => (
          <AccordionItem
            key={subscription.id}
            title={`${subscription.tag} (${subscription.nodes.edges.length})`}
            subtitle={dayjs(subscription.updatedAt).format('YYYY-MM-DD hh:mm:ss')}
            startContent={
              <div className="flex items-center gap-2">
                <Button
                  color="success"
                  as="div"
                  isIconOnly
                  isLoading={updateSubscriptionsMutation.isPending}
                  onPress={() => updateSubscriptionsMutation.mutate({ subscriptionIDs: [subscription.id] })}
                >
                  <IconRefresh />
                </Button>

                <Fragment>
                  <Button color="danger" as="div" isIconOnly onPress={onRemoveSubscriptionOpen}>
                    <IconTrash />
                  </Button>

                  <Modal isOpen={isRemoveSubscriptionOpen} onOpenChange={onRemoveSubscriptionOpenChange}>
                    <ModalContent>
                      <ModalHeader>
                        {t('primitives.remove', { resourceName: t('primitives.subscription') })}
                      </ModalHeader>
                      <ModalBody>{subscription.tag}</ModalBody>

                      <ModalConfirmFormFooter
                        onCancel={onRemoveSubscriptionClose}
                        isSubmitting={removeSubscriptionsMutation.isPending}
                        onConfirm={async () => {
                          await removeSubscriptionsMutation.mutateAsync({ subscriptionIDs: [subscription.id] })

                          onRemoveSubscriptionClose()
                        }}
                      />
                    </ModalContent>
                  </Modal>
                </Fragment>
              </div>
            }
          >
            <SubscriptionNodeTable nodes={subscription.nodes.edges} />
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
