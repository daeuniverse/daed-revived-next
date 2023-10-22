import { zodResolver } from '@hookform/resolvers/zod'
import {
  Input,
  ModalBody,
  ModalContent,
  ModalHeader,
  Snippet,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
  useDisclosure
} from '@nextui-org/react'
import { IconPlus, IconQrcode, IconTrash, IconUpload } from '@tabler/icons-react'
import { QRCodeSVG } from 'qrcode.react'
import { FC, Fragment, Key, useCallback, useMemo } from 'react'
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useImportNodesMutation, useRemoveNodesMutation } from '~/apis/mutation'
import { Node } from '~/app/(protected)/network/typings'
import { Button } from '~/components/Button'
import { Modal, ModalConfirmFormFooter, ModalSubmitFormFooter } from '~/components/Modal'
import { nodeFormDefault, nodeFormSchema } from '~/schemas/node'

const CheckNodeQRCodeButton: FC<{ name: string; link: string }> = ({ name, link }) => {
  const {
    isOpen: isCheckNodeQRCodeOpen,
    onOpenChange: onCheckNodeQRCodeOpenChange,
    onOpen: onCheckNodeQRCodeOpen
  } = useDisclosure()

  return (
    <Fragment>
      <Button color="primary" isIconOnly onPress={onCheckNodeQRCodeOpen}>
        <IconQrcode />
      </Button>

      <Modal isOpen={isCheckNodeQRCodeOpen} onOpenChange={onCheckNodeQRCodeOpenChange}>
        <ModalContent>
          <ModalHeader>{name}</ModalHeader>
          <ModalBody className="flex flex-col items-center gap-8 p-8">
            <QRCodeSVG className="h-64 w-64" value={link} />

            <Snippet symbol={false} variant="bordered">
              <span className="whitespace-break-spaces break-all">{link}</span>
            </Snippet>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Fragment>
  )
}

const RemoveNodeButton: FC<{ id: string; name: string }> = ({ id, name }) => {
  const { t } = useTranslation()

  const {
    isOpen: isRemoveOpen,
    onOpen: onRemoveOpen,
    onClose: onRemoveClose,
    onOpenChange: onRemoveOpenChange
  } = useDisclosure()

  const removeNodesMutation = useRemoveNodesMutation()

  return (
    <Fragment>
      <Button color="danger" as="div" isIconOnly onPress={onRemoveOpen}>
        <IconTrash />
      </Button>

      <Modal isOpen={isRemoveOpen} onOpenChange={onRemoveOpenChange}>
        <ModalContent>
          <ModalHeader>{t('primitives.remove', { resourceName: t('primitives.node') })}</ModalHeader>
          <ModalBody>{name}</ModalBody>

          <ModalConfirmFormFooter
            onCancel={onRemoveClose}
            isSubmitting={removeNodesMutation.isPending}
            onConfirm={async () => {
              await removeNodesMutation.mutateAsync({ nodeIDs: [id] })

              onRemoveClose()
            }}
          />
        </ModalContent>
      </Modal>
    </Fragment>
  )
}

const NodeTable: FC<{
  nodes: Node[]
  isLoading?: boolean
}> = ({ nodes, isLoading }) => {
  const { t } = useTranslation()

  const nodesTableColumns = useMemo(
    () => [
      { key: 'name', name: t('primitives.name') },
      { key: 'protocol', name: t('primitives.protocol') },
      { key: 'address', name: t('primitives.address') },
      { key: 'action', name: t('primitives.action') }
    ],
    [t]
  )

  const renderCell = useCallback((item: Node, columnKey: Key) => {
    switch (columnKey) {
      case 'name':
        return item.tag || item.name

      case 'action':
        return (
          <div className="flex items-center gap-2">
            <CheckNodeQRCodeButton name={item.tag || item.name} link={item.link} />

            <RemoveNodeButton id={item.id} name={item.tag || item.name} />
          </div>
        )

      default:
        return getKeyValue(item, columnKey)
    }
  }, [])

  return (
    <Table isCompact aria-label="nodes">
      <TableHeader columns={nodesTableColumns}>
        {(column) => <TableColumn key={column.key}>{column.name}</TableColumn>}
      </TableHeader>

      <TableBody items={nodes} isLoading={isLoading}>
        {(item) => (
          <TableRow key={item.id}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>
        )}
      </TableBody>
    </Table>
  )
}

const ImportNodeInputList: FC<{ name: string }> = ({ name }) => {
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

export const NodeSection: FC<{ nodes: Node[]; isLoading?: boolean }> = ({ nodes, isLoading }) => {
  const { t } = useTranslation()
  const {
    isOpen: isImportNodeOpen,
    onOpen: onImportNodeOpen,
    onClose: onImportNodeClose,
    onOpenChange: onImportNodeOpenChange
  } = useDisclosure()

  const importNodeForm = useForm<z.infer<typeof nodeFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(nodeFormSchema),
    defaultValues: nodeFormDefault
  })

  const importNodesMutation = useImportNodesMutation()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{t('primitives.node')}</h3>
        <Button color="primary" isIconOnly onPress={onImportNodeOpen}>
          <IconUpload />
        </Button>

        <Modal isOpen={isImportNodeOpen} onOpenChange={onImportNodeOpenChange}>
          <FormProvider {...importNodeForm}>
            <form
              onSubmit={importNodeForm.handleSubmit(async (values) => {
                await importNodesMutation.mutateAsync(values.nodes)

                onImportNodeClose()
              })}
            >
              <ModalContent>
                <ModalHeader>{t('primitives.node')}</ModalHeader>

                <ModalBody>
                  <ImportNodeInputList name="nodes" />
                </ModalBody>

                <ModalSubmitFormFooter reset={importNodeForm.reset} isSubmitting={importNodesMutation.isPending} />
              </ModalContent>
            </form>
          </FormProvider>
        </Modal>
      </div>

      <NodeTable nodes={nodes} isLoading={isLoading} />
    </div>
  )
}
