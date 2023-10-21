import {
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
import { IconPlus, IconQrcode, IconTrash } from '@tabler/icons-react'
import { QRCodeSVG } from 'qrcode.react'
import { FC, Fragment, Key, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRemoveNodesMutation } from '~/apis/mutation'
import { Node } from '~/app/(protected)/network/typings'
import { Button } from '~/components/Button'
import { Modal, ModalConfirmFormFooter } from '~/components/Modal'

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

const RemoveNodeButton: FC<{ id: string; name: string; refetch: () => Promise<unknown> }> = ({ id, name, refetch }) => {
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
              await refetch()

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
  refetch: () => Promise<unknown>
  isLoading?: boolean
}> = ({ nodes, refetch, isLoading }) => {
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

  const renderCell = useCallback(
    (item: Node, columnKey: Key) => {
      switch (columnKey) {
        case 'name':
          return item.tag || item.name

        case 'action':
          return (
            <div className="flex items-center gap-2">
              <CheckNodeQRCodeButton name={item.tag || item.name} link={item.link} />

              <RemoveNodeButton id={item.id} name={item.tag || item.name} refetch={refetch} />
            </div>
          )

        default:
          return getKeyValue(item, columnKey)
      }
    },
    [refetch]
  )

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

export const NodeSection: FC<{ nodes: Node[]; refetch: () => Promise<unknown>; isLoading?: boolean }> = ({
  nodes,
  refetch,
  isLoading
}) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{t('primitives.node')}</h3>
        <Button color="primary" isIconOnly>
          <IconPlus />
        </Button>
      </div>

      <NodeTable nodes={nodes} refetch={refetch} isLoading={isLoading} />
    </div>
  )
}
