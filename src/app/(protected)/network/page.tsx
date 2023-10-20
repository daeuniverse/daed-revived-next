'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Accordion,
  AccordionItem,
  Chip,
  getKeyValue,
  Input,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Snippet,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure
} from '@nextui-org/react'
import { IconPlus, IconQrcode, IconRefresh, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { differenceWith } from 'lodash'
import { QRCodeSVG } from 'qrcode.react'
import { FC, Fragment, Key, useCallback, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Policy } from '~/apis/gql/graphql'
import {
  useCreateGroupMutation,
  useGroupAddNodesMutation,
  useGroupAddSubscriptionsMutation,
  useGroupDelNodesMutation,
  useGroupDelSubscriptionsMutation,
  useRemoveGroupsMutation,
  useRemoveNodesMutation,
  useRemoveSubscriptionsMutation,
  useUpdateSubscriptionsMutation
} from '~/apis/mutation'
import { useGroupsQuery, useNodesQuery, useSubscriptionsQuery } from '~/apis/query'
import { Button } from '~/components/Button'
import { Modal, ModalConfirmFormFooter } from '~/components/Modal'
import { ResourcePage } from '~/components/ResourcePage'
import { createGroupFormDefault, createGroupFormSchema } from '~/schemas/group'

type Node = {
  id: string
  name: string
  tag?: string | null
  protocol: string
  link: string
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
    isOpen: isRemoveGroupOpen,
    onOpen: onRemoveGroupOpen,
    onClose: onRemoveGroupClose,
    onOpenChange: onRemoveGroupOpenChange
  } = useDisclosure()

  const {
    isOpen: isRemoveSubscriptionOpen,
    onOpen: onRemoveSubscriptionOpen,
    onClose: onRemoveSubscriptionClose,
    onOpenChange: onRemoveSubscriptionOpenChange
  } = useDisclosure()

  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose, onOpenChange: onAddOpenChange } = useDisclosure()

  const groupsQuery = useGroupsQuery()
  const removeGroupsMutation = useRemoveGroupsMutation()

  const subscriptionsQuery = useSubscriptionsQuery()
  const nodesQuery = useNodesQuery()
  const removeSubscriptionsMutation = useRemoveSubscriptionsMutation()
  const updateSubscriptionsMutation = useUpdateSubscriptionsMutation()

  const createGroupForm = useForm<z.infer<typeof createGroupFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: createGroupFormDefault
  })
  const createGroupFormDirty = Object.values(createGroupForm.formState.dirtyFields).some((dirty) => dirty)

  const createGroupMutation = useCreateGroupMutation()

  const policies = [
    {
      label: Policy.MinMovingAvg,
      value: Policy.MinMovingAvg,
      description: t('form.descriptions.group.MinMovingAvg')
    },
    {
      label: Policy.MinAvg10,
      value: Policy.MinAvg10,
      description: t('form.descriptions.group.MinAvg10')
    },
    {
      label: Policy.Min,
      value: Policy.Min,
      description: t('form.descriptions.group.Min')
    },
    {
      label: Policy.Random,
      value: Policy.Random,
      description: t('form.descriptions.group.Random')
    }
  ]

  return (
    <ResourcePage name={t('primitives.network')}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-lg">
          <div className="flex items-center justify-between rounded">
            <h3 className="text-xl font-bold">{t('primitives.group')}</h3>

            <Fragment>
              <Button color="primary" isIconOnly onPress={onAddOpen}>
                <IconPlus />
              </Button>

              <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange}>
                <form
                  onSubmit={createGroupForm.handleSubmit(async (values) => {
                    await createGroupMutation.mutateAsync({
                      name: values.name,
                      policy: values.policy,
                      policyParams: []
                    })
                    await groupsQuery.refetch()

                    onAddClose()
                  })}
                >
                  <ModalContent>
                    <ModalHeader>{t('primitives.group')}</ModalHeader>
                    <ModalBody>
                      <Input
                        label={t('form.fields.name')}
                        placeholder={t('form.fields.name')}
                        isRequired
                        errorMessage={createGroupForm.formState.errors.name?.message}
                        {...createGroupForm.register('name')}
                      />

                      <Controller
                        name="policy"
                        control={createGroupForm.control}
                        render={({ field }) => (
                          <Select
                            label={t('primitives.policy')}
                            placeholder={t('primitives.policy')}
                            items={policies}
                            disallowEmptySelection
                            selectedKeys={field.value ? [field.value] : []}
                            onChange={field.onChange}
                          >
                            {(item) => (
                              <SelectItem
                                key={item.value}
                                value={item.value}
                                textValue={item.value}
                                description={item.description}
                              >
                                {item.label}
                              </SelectItem>
                            )}
                          </Select>
                        )}
                      />
                    </ModalBody>

                    <ModalFooter>
                      <Button
                        type="reset"
                        color="secondary"
                        isDisabled={!createGroupFormDirty}
                        onPress={() => createGroupForm.reset()}
                      >
                        {t('actions.reset')}
                      </Button>

                      <Button type="submit" color="primary" isLoading={createGroupMutation.isPending}>
                        {t('actions.confirm')}
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </form>
              </Modal>
            </Fragment>
          </div>

          {groupsQuery.data &&
            groupsQuery.data.groups.map((group) => (
              <Accordion key={group.id} variant="shadow">
                <AccordionItem
                  title={group.name}
                  subtitle={group.policy}
                  startContent={
                    <Fragment>
                      <Button color="danger" as="div" isIconOnly onPress={onRemoveGroupOpen}>
                        <IconTrash />
                      </Button>

                      <Modal isOpen={isRemoveGroupOpen} onOpenChange={onRemoveGroupOpenChange}>
                        <ModalContent>
                          <ModalHeader>{t('primitives.remove', { resourceName: t('primitives.group') })}</ModalHeader>
                          <ModalBody>{group.name}</ModalBody>

                          <ModalConfirmFormFooter
                            onCancel={onRemoveGroupClose}
                            isSubmitting={removeGroupsMutation.isPending}
                            onConfirm={async () => {
                              await removeGroupsMutation.mutateAsync({
                                groupIDs: [group.id]
                              })
                              await groupsQuery.refetch()

                              onRemoveGroupClose()
                            }}
                          />
                        </ModalContent>
                      </Modal>
                    </Fragment>
                  }
                >
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
                                await subscriptionsQuery.refetch()

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
          )}
        </div>
      </div>
    </ResourcePage>
  )
}
