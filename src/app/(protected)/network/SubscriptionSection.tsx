import {
  Accordion,
  AccordionItem,
  getKeyValue,
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
import { IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { FC, Fragment, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRemoveSubscriptionsMutation, useUpdateSubscriptionsMutation } from '~/apis/mutation'
import { Button } from '~/components/Button'
import { Modal, ModalConfirmFormFooter } from '~/components/Modal'
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

export const SubscriptionSection: FC<{ subscriptions: Subscription[]; refetch: () => Promise<unknown> }> = ({
  subscriptions,
  refetch
}) => {
  const { t } = useTranslation()

  const {
    isOpen: isRemoveSubscriptionOpen,
    onOpen: onRemoveSubscriptionOpen,
    onClose: onRemoveSubscriptionClose,
    onOpenChange: onRemoveSubscriptionOpenChange
  } = useDisclosure()

  const removeSubscriptionsMutation = useRemoveSubscriptionsMutation()
  const updateSubscriptionsMutation = useUpdateSubscriptionsMutation()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{t('primitives.subscription')}</h3>

        <Button color="primary" isIconOnly>
          <IconPlus />
        </Button>
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
                  onPress={() =>
                    updateSubscriptionsMutation.mutate({
                      subscriptionIDs: [subscription.id]
                    })
                  }
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
                          await refetch()

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
