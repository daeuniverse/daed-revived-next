'use client'

import { Accordion, AccordionItem, Chip, Select, SelectItem } from '@nextui-org/react'
import { IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { differenceWith } from 'lodash'
import { FC, useMemo } from 'react'
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

    nodes: {
      edges: {
        id: string
        name: string
        tag?: string | null
      }[]
    }
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
    <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
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
