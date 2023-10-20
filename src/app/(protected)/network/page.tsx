'use client'

import {
  Accordion,
  AccordionItem,
  Avatar,
  Chip,
  getKeyValue,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
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
import { differenceWith } from 'lodash'
import { FC, Fragment, Key, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useGroupAddNodesMutation,
  useGroupAddSubscriptionsMutation,
  useGroupDelNodesMutation,
  useGroupDelSubscriptionsMutation,
  useRemoveNodesMutation,
  useRemoveSubscriptionsMutation,
  useUpdateSubscriptionsMutation
} from '~/apis/mutation'
import { useGroupsQuery, useNodesQuery, useSubscriptionsQuery } from '~/apis/query'
import { Button } from '~/components/Button'
import { Modal } from '~/components/Modal'
import { ResourcePage } from '~/components/ResourcePage'

type Node = {
  id: string
  name: string
  tag?: string | null
  protocol: string
  subscriptionID?: string | null
}

type Group = {
  id: string
  name: string
  policy: string
  nodes: Node[]
  subscriptions: {
    id: string
    tag?: string | null
    updatedAt: string

    nodes: {
      edges: Node[]
    }
  }[]
}

const GroupContent: FC<{
  group: Group

  subscriptions: {
    id: string
    tag?: string | null

    nodes: { edges: Node[] }
  }[]

  nodes: Node[]

  refetch: () => Promise<unknown>
}> = ({ group, subscriptions, nodes, refetch }) => {
  const { t } = useTranslation()

  // subscriptions
  const allSubscriptions = useMemo(() => subscriptions.map(({ id }) => id), [subscriptions])
  const selectedSubscriptions = useMemo(
    () => group.subscriptions.map((subscription) => subscription.id),
    [group.subscriptions]
  )
  const groupAddSubscriptionsMutation = useGroupAddSubscriptionsMutation()
  const groupDelSubscriptionsMutation = useGroupDelSubscriptionsMutation()

  // nodes
  const allNodes = useMemo(() => nodes.map(({ id }) => id), [nodes])
  const selectedNodes = useMemo(() => group.nodes.map((node) => node.id), [group.nodes])
  const groupAddNodesMutation = useGroupAddNodesMutation()
  const groupDelNodesMutation = useGroupDelNodesMutation()

  return (
    <div className="flex flex-col gap-4 py-4">
      <Select
        label={t('primitives.node')}
        placeholder={t('primitives.node')}
        variant="bordered"
        isMultiline
        selectionMode="multiple"
        labelPlacement="outside"
        classNames={{ trigger: 'py-2' }}
        items={nodes
          .map(({ id, tag, name }) => ({ id, name: tag || name, subscription: '' }))
          .concat(
            subscriptions
              .map((subscription) =>
                subscription.nodes.edges.map(({ id, tag, name }) => ({
                  id,
                  name: tag || name,
                  subscription: subscription.tag || ''
                }))
              )
              .flatMap((node) => node)
          )}
        selectedKeys={selectedNodes}
        onSelectionChange={async (selected) => {
          const nodesToAdd = differenceWith(
            selected === 'all' ? allNodes : (Array.from(selected) as string[]),
            selectedNodes
          )
          const nodesToRemove = differenceWith(
            selectedNodes,
            selected === 'all' ? allNodes : (Array.from(selected) as string[])
          )

          if (nodesToAdd.length > 0) {
            await groupAddNodesMutation.mutateAsync({ id: group.id, nodeIDs: nodesToAdd })
          }

          if (nodesToRemove.length > 0) {
            await groupDelNodesMutation.mutateAsync({ id: group.id, nodeIDs: nodesToRemove })
          }

          await refetch()
        }}
        renderValue={(items) => (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => {
              const nodeID = item.textValue!
              const nodeName = item.data?.name

              return (
                <Chip
                  key={item.key}
                  classNames={{ base: 'max-w-full', content: 'truncate' }}
                  onClose={async () => {
                    await groupDelNodesMutation.mutateAsync({ id: group.id, nodeIDs: [nodeID] })
                    await refetch()
                  }}
                >
                  {nodeName} {item.data?.subscription && `(${item.data.subscription})`}
                </Chip>
              )
            })}
          </div>
        )}
      >
        {(node) => (
          <SelectItem key={node.id} textValue={node.id}>
            {node.name} {node.subscription && `(${node.subscription})`}
          </SelectItem>
        )}
      </Select>

      <Select
        variant="bordered"
        label={t('primitives.subscription')}
        placeholder={t('primitives.subscription')}
        isMultiline={true}
        selectionMode="multiple"
        labelPlacement="outside"
        classNames={{ trigger: 'py-2' }}
        selectedKeys={selectedSubscriptions}
        onSelectionChange={async (selected) => {
          const subscriptionsToAdd = differenceWith(
            selected === 'all' ? allSubscriptions : (Array.from(selected) as string[]),
            selectedSubscriptions
          )
          const subscriptionsToRemove = differenceWith(
            selectedSubscriptions,
            selected === 'all' ? allSubscriptions : (Array.from(selected) as string[])
          )

          if (subscriptionsToAdd.length > 0) {
            await groupAddSubscriptionsMutation.mutateAsync({ id: group.id, subscriptionIDs: subscriptionsToAdd })
          }

          if (subscriptionsToRemove.length > 0) {
            await groupDelSubscriptionsMutation.mutateAsync({ id: group.id, subscriptionIDs: subscriptionsToRemove })
          }

          await refetch()
        }}
        items={subscriptions}
        renderValue={(items) => (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <Chip
                key={item.key}
                classNames={{
                  content: 'block truncate'
                }}
                onClose={async () => {
                  await groupDelSubscriptionsMutation.mutateAsync({ id: group.id, subscriptionIDs: [item.data!.id] })
                  await refetch()
                }}
              >
                {item.data!.tag}
              </Chip>
            ))}
          </div>
        )}
      >
        {(subscription) => (
          <SelectItem key={subscription.id} value={subscription.id} textValue={subscription.id}>
            {subscription.tag}
          </SelectItem>
        )}
      </Select>
    </div>
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

          <ModalFooter>
            <Button color="secondary" onPress={onRemoveClose}>
              {t('actions.cancel')}
            </Button>

            <Button
              color="danger"
              isLoading={removeNodesMutation.isPending}
              onPress={async () => {
                await removeNodesMutation.mutateAsync({ nodeIDs: [id] })
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
  )
}

const NodeTable: FC<{
  nodes: Node[]
  refetch: () => Promise<unknown>
  isLoading: boolean
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
          return <RemoveNodeButton id={item.id} name={item.tag || item.name} refetch={refetch} />

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

export default function NetworkPage() {
  const { t } = useTranslation()

  const {
    isOpen: isRemoveOpen,
    onOpen: onRemoveOpen,
    onClose: onRemoveClose,
    onOpenChange: onRemoveOpenChange
  } = useDisclosure()

  const groupsQuery = useGroupsQuery()
  const subscriptionsQuery = useSubscriptionsQuery()
  const nodesQuery = useNodesQuery()
  const removeSubscriptionsMutation = useRemoveSubscriptionsMutation()
  const updateSubscriptionsMutation = useUpdateSubscriptionsMutation()

  return (
    <ResourcePage name={t('primitives.network')}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-lg">
          <div className="flex items-center justify-between rounded">
            <h3 className="text-xl font-bold">{t('primitives.group')}</h3>

            <Button color="primary" isIconOnly>
              <IconPlus />
            </Button>
          </div>

          {groupsQuery.data &&
            groupsQuery.data.groups.map((group) => (
              <Accordion key={group.id} variant="shadow">
                <AccordionItem title={group.name} subtitle={group.policy}>
                  <GroupContent
                    group={group}
                    subscriptions={subscriptionsQuery.data?.subscriptions || []}
                    nodes={nodesQuery.data?.nodes.edges || []}
                    refetch={groupsQuery.refetch}
                  />
                </AccordionItem>
              </Accordion>
            ))}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{t('primitives.node')}</h3>
            <Button color="primary" isIconOnly>
              <IconPlus />
            </Button>
          </div>

          <NodeTable
            nodes={nodesQuery.data?.nodes.edges || []}
            refetch={nodesQuery.refetch}
            isLoading={nodesQuery.isLoading}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{t('primitives.subscription')}</h3>

            <Button color="primary" isIconOnly>
              <IconPlus />
            </Button>
          </div>

          {subscriptionsQuery.data && (
            <Accordion selectionMode="multiple" variant="shadow" isCompact>
              {subscriptionsQuery.data.subscriptions.map((subscription) => (
                <AccordionItem
                  key={subscription.id}
                  title={`${subscription.tag} (${subscription.nodes.edges.length})`}
                  subtitle={dayjs(subscription.updatedAt).format('YYYY-MM-DD hh:mm:ss')}
                  startContent={
                    <div className="flex gap-2">
                      <Avatar name={subscription.tag!} />

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
                        <Button color="danger" as="div" isIconOnly onPress={onRemoveOpen}>
                          <IconTrash />
                        </Button>

                        <Modal isOpen={isRemoveOpen} onOpenChange={onRemoveOpenChange}>
                          <ModalContent>
                            <ModalHeader>
                              {t('primitives.remove', { resourceName: t('primitives.subscription') })}
                            </ModalHeader>
                            <ModalBody>{subscription.tag}</ModalBody>

                            <ModalFooter>
                              <Button color="secondary" onPress={onRemoveClose}>
                                {t('actions.cancel')}
                              </Button>

                              <Button
                                color="danger"
                                isLoading={removeSubscriptionsMutation.isPending}
                                onPress={async () => {
                                  await removeSubscriptionsMutation.mutateAsync({ subscriptionIDs: [subscription.id] })
                                  await subscriptionsQuery.refetch()

                                  onRemoveClose()
                                }}
                              >
                                {t('actions.confirm')}
                              </Button>
                            </ModalFooter>
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
          )}
        </div>
      </div>
    </ResourcePage>
  )
}
