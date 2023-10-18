'use client'

import {
  Accordion,
  AccordionItem,
  Listbox,
  ListboxItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
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
import { FC, Key, ReactNode, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useGroupAddNodesMutation,
  useGroupAddSubscriptionsMutation,
  useGroupDelNodesMutation,
  useGroupDelSubscriptionsMutation,
  useUpdateSubscriptionsMutation
} from '~/apis/mutation'
import { useGroupsQuery, useNodesQuery, useSubscriptionsQuery } from '~/apis/query'
import { Button } from '~/components/Button'
import { NodeCard } from '~/components/NodeCard'
import { ResourcePage } from '~/components/ResourcePage'

type Group = {
  id: string
  name: string
  policy: string
  nodes: {
    id: string
    name: string
    tag?: string | null
    protocol: string
    subscriptionID?: string | null
  }[]
  subscriptions: {
    id: string
    tag?: string | null
    updatedAt: string

    nodes: {
      edges: {
        id: string
        name: string
        tag?: string | null
        protocol: string
        subscriptionID?: string | null
      }[]
    }
  }[]
}

const GroupTable: FC<{
  group: Group

  subscriptions: {
    id: string
    tag?: string | null
  }[]

  nodes: {
    id: string
    name: string
    tag?: string | null
  }[]

  refetch: () => Promise<unknown>
}> = ({ group, subscriptions, nodes, refetch }) => {
  const { t } = useTranslation()

  // subscriptions
  const {
    isOpen: isAddSubscriptionsTooltipOpen,
    onOpenChange: onAddSubscriptionsTooltipOpenChange,
    onOpen: onAddSubscriptionsTooltipOpen,
    onClose: onAddSubscriptionsTooltipClose
  } = useDisclosure()

  const selectableSubscriptions = useMemo(() => {
    const selectedSubscriptionIDs = group.subscriptions.map((subscription) => subscription.id)

    return subscriptions.filter((subscription) => !selectedSubscriptionIDs.includes(subscription.id))
  }, [group.subscriptions, subscriptions])
  const [selectedSubscriptionsToRemove, setSelectedSubscriptionsToRemove] = useState<string[]>([])
  const allSubscriptions = useMemo(
    () => group.subscriptions.map((subscription) => subscription.id),
    [group.subscriptions]
  )
  const [selectedSubscriptionsToAdd, setSelectedSubscriptionsToAdd] = useState<string[]>([])
  const groupAddSubscriptionsMutation = useGroupAddSubscriptionsMutation()
  const groupDelSubscriptionsMutation = useGroupDelSubscriptionsMutation()

  const subscriptionTableColumns: {
    key: string
    name: string
  }[] = [
    { key: 'tag', name: t('primitives.tag') },
    {
      key: 'updatedAt',
      name: t('primitives.updatedAt')
    },
    { key: 'node', name: t('primitives.node') },
    { key: 'remove', name: t('actions.remove') }
  ]

  const renderSubscriptionCell = useCallback(
    (subscription: Group['subscriptions'][number], columnKey: Key) => {
      const cellValue = subscription[columnKey as keyof Group['subscriptions'][number]] as ReactNode

      switch (columnKey) {
        case 'updatedAt':
          return dayjs(cellValue as string).format('YYYY-MM-DD hh:mm:ss')

        case 'node':
          return subscription.nodes.edges.length

        case 'remove':
          return (
            <Button
              color="danger"
              isIconOnly
              onPress={async () => {
                await groupDelSubscriptionsMutation.mutateAsync({
                  id: group.id,
                  subscriptionIDs: [subscription.id]
                })
                await refetch()
              }}
            >
              <IconTrash />
            </Button>
          )

        default:
          return cellValue
      }
    },
    [group.id, groupDelSubscriptionsMutation, refetch]
  )

  // nodes
  const {
    isOpen: isAddNodesTooltipOpen,
    onOpenChange: onAddNodesTooltipOpenChange,
    onOpen: onAddNodesTooltipOpen,
    onClose: onAddNodesTooltipClose
  } = useDisclosure()
  const selectableNodes = useMemo(() => {
    const selectedNodeIDs = group.nodes.map((node) => node.id)

    return nodes.filter((node) => !selectedNodeIDs.includes(node.id))
  }, [group.nodes, nodes])
  const [selectedNodesToRemove, setSelectedNodesToRemove] = useState<string[]>([])
  const [selectedNodesToAdd, setSelectedNodesToAdd] = useState<string[]>([])
  const allNodes = useMemo(() => group.nodes.map((node) => node.id), [group.nodes])
  const groupAddNodesMutation = useGroupAddNodesMutation()
  const groupDelNodesMutation = useGroupDelNodesMutation()

  const nodeTableColumns: {
    key: string
    name: string
  }[] = [
    { key: 'name', name: t('primitives.name') },
    { key: 'protocol', name: t('primitives.protocol') },
    { key: 'subscriptionID', name: t('primitives.subscription') },
    { key: 'remove', name: t('actions.remove') }
  ]

  const renderNodeCell = useCallback(
    (node: Group['nodes'][number], columnKey: Key) => {
      const cellValue = node[columnKey as keyof Group['nodes'][number]] as ReactNode

      switch (columnKey) {
        case 'name':
          return node.tag || node.name

        case 'remove':
          return (
            <Button
              color="danger"
              isIconOnly
              onPress={async () => {
                await groupDelNodesMutation.mutateAsync({
                  id: group.id,
                  nodeIDs: [node.id]
                })
                await refetch()
              }}
            >
              <IconTrash />
            </Button>
          )

        default:
          return cellValue
      }
    },
    [group.id, groupDelNodesMutation, refetch]
  )

  return (
    <div className="flex flex-col gap-2">
      <Accordion selectionMode="multiple" variant="splitted">
        <AccordionItem key="subscriptions" title={`${t('primitives.subscription')} (${group.subscriptions.length})`}>
          <Table
            aria-label="subscription table"
            selectionMode="multiple"
            selectedKeys={selectedSubscriptionsToRemove}
            onSelectionChange={(selectedSubscriptions) =>
              setSelectedSubscriptionsToRemove(
                selectedSubscriptions === 'all' ? allSubscriptions : Array.from(selectedSubscriptions as Set<string>)
              )
            }
            topContent={
              <div className="flex gap-2">
                <Popover
                  isOpen={isAddSubscriptionsTooltipOpen}
                  onOpenChange={onAddSubscriptionsTooltipOpenChange}
                  placement="left"
                  showArrow
                >
                  <PopoverTrigger>
                    <Button
                      color="primary"
                      onPress={onAddSubscriptionsTooltipOpen}
                      isDisabled={selectableSubscriptions.length === 0}
                      isIconOnly
                    >
                      <IconPlus />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent>
                    <div className="flex flex-col gap-4 p-4">
                      <Listbox
                        aria-label="select subscriptions"
                        variant="flat"
                        selectionMode="multiple"
                        selectedKeys={selectedSubscriptionsToAdd}
                        onSelectionChange={(selectedSubscriptions) =>
                          setSelectedSubscriptionsToAdd(
                            selectedSubscriptions === 'all'
                              ? allSubscriptions
                              : Array.from(selectedSubscriptions as Set<string>)
                          )
                        }
                      >
                        {selectableSubscriptions.map((subscription) => (
                          <ListboxItem key={subscription.id}>{subscription.tag}</ListboxItem>
                        ))}
                      </Listbox>

                      <Button
                        color="primary"
                        size="sm"
                        isDisabled={selectedSubscriptionsToAdd.length === 0}
                        onPress={async () => {
                          await groupAddSubscriptionsMutation.mutateAsync({
                            id: group.id,
                            subscriptionIDs: selectedSubscriptionsToAdd
                          })

                          await refetch()

                          setSelectedSubscriptionsToAdd([])
                          onAddSubscriptionsTooltipClose()
                        }}
                      >
                        {t('actions.confirm')}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button
                  color="danger"
                  onPress={async () => {
                    await groupDelSubscriptionsMutation.mutateAsync({
                      id: group.id,
                      subscriptionIDs: selectedSubscriptionsToRemove
                    })

                    await refetch()

                    setSelectedSubscriptionsToRemove([])
                  }}
                  isDisabled={selectedSubscriptionsToRemove.length === 0}
                  isIconOnly
                >
                  <IconTrash />
                </Button>
              </div>
            }
          >
            <TableHeader columns={subscriptionTableColumns}>
              {(column) => <TableColumn key={column.key}>{column.name}</TableColumn>}
            </TableHeader>

            <TableBody items={group.subscriptions}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => <TableCell>{renderSubscriptionCell(item, columnKey)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </AccordionItem>

        <AccordionItem key="nodes" title={`${t('primitives.node')} (${nodes.length})`}>
          <Table
            aria-label="node table"
            selectionMode="multiple"
            selectedKeys={selectedNodesToRemove}
            onSelectionChange={(selectedNodes) =>
              setSelectedNodesToRemove(selectedNodes === 'all' ? allNodes : Array.from(selectedNodes as Set<string>))
            }
            topContent={
              <div className="flex gap-2">
                <Popover
                  isOpen={isAddNodesTooltipOpen}
                  onOpenChange={onAddNodesTooltipOpenChange}
                  placement="left"
                  showArrow
                >
                  <PopoverTrigger>
                    <Button
                      color="primary"
                      onPress={onAddNodesTooltipOpen}
                      isDisabled={selectableNodes.length === 0}
                      isIconOnly
                    >
                      <IconPlus />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent>
                    <div className="flex flex-col gap-4 p-4">
                      <Listbox
                        aria-label="select subscriptions"
                        variant="flat"
                        selectionMode="multiple"
                        selectedKeys={selectedNodesToAdd}
                        onSelectionChange={(selectedNodes) =>
                          setSelectedNodesToAdd(
                            selectedNodes === 'all' ? allNodes : Array.from(selectedNodes as Set<string>)
                          )
                        }
                      >
                        {selectableNodes.map((subscription) => (
                          <ListboxItem key={subscription.id}>{subscription.tag}</ListboxItem>
                        ))}
                      </Listbox>

                      <Button
                        color="primary"
                        size="sm"
                        isDisabled={selectedNodesToAdd.length === 0}
                        onPress={async () => {
                          await groupAddNodesMutation.mutateAsync({
                            id: group.id,
                            nodeIDs: selectedNodesToAdd
                          })

                          await refetch()

                          setSelectedNodesToAdd([])
                          onAddNodesTooltipClose()
                        }}
                      >
                        {t('actions.confirm')}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button
                  color="danger"
                  onPress={async () => {
                    await groupDelNodesMutation.mutateAsync({
                      id: group.id,
                      nodeIDs: selectedNodesToRemove
                    })

                    await refetch()

                    setSelectedNodesToRemove([])
                  }}
                  isDisabled={selectedNodesToRemove.length === 0}
                  isIconOnly
                >
                  <IconTrash />
                </Button>
              </div>
            }
          >
            <TableHeader columns={nodeTableColumns}>
              {(column) => <TableColumn key={column.key}>{column.name}</TableColumn>}
            </TableHeader>

            <TableBody emptyContent={'No rows to display.'} items={group.nodes}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => <TableCell>{renderNodeCell(item, columnKey)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default function OrchestratePage() {
  const { t } = useTranslation()
  const groupsQuery = useGroupsQuery()
  const subscriptionsQuery = useSubscriptionsQuery()
  const nodesQuery = useNodesQuery()
  const updateSubscriptionsMutation = useUpdateSubscriptionsMutation()

  return (
    <ResourcePage name={t('primitives.orchestrate')}>
      <div className="flex flex-col gap-8">
        <div className="col-span-2 flex flex-col gap-4 rounded-lg">
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
                  <GroupTable
                    group={group}
                    subscriptions={subscriptionsQuery.data?.subscriptions || []}
                    nodes={nodesQuery.data?.nodes.edges || []}
                    refetch={groupsQuery.refetch}
                  />
                </AccordionItem>
              </Accordion>
            ))}
        </div>

        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div className="col-span-2 flex flex-col gap-4 rounded-lg sm:col-span-1">
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
                        <Button color="danger" isIconOnly as="div">
                          <IconTrash />
                        </Button>

                        <Button
                          color="success"
                          as="div"
                          isLoading={updateSubscriptionsMutation.isPending}
                          isIconOnly
                          onPress={() =>
                            updateSubscriptionsMutation.mutate({
                              subscriptionIDs: [subscription.id]
                            })
                          }
                        >
                          <IconRefresh />
                        </Button>
                      </div>
                    }
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {subscription.nodes.edges.map((node) => (
                        <NodeCard key={node.id} node={node} />
                      ))}
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          <div className="col-span-2 flex flex-col gap-4 rounded-lg sm:col-span-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{t('primitives.node')}</h3>
              <Button color="primary" isIconOnly>
                <IconPlus />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {nodesQuery.data?.nodes.edges.map((node) => <NodeCard key={node.id} node={node} />)}
            </div>
          </div>
        </div>
      </div>
    </ResourcePage>
  )
}
