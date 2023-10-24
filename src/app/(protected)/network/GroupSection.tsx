'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Divider } from '@nextui-org/divider'
import {
  Accordion,
  AccordionItem,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure
} from '@nextui-org/react'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { differenceWith } from 'lodash'
import { FC, Fragment, useMemo } from 'react'
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
  useGroupSetPolicyMutation,
  useRemoveGroupsMutation
} from '~/apis/mutation'
import { useGroupsQuery } from '~/apis/query'
import { Group, Node, Subscription } from '~/app/(protected)/network/typings'
import { Button } from '~/components/Button'
import { Modal, ModalConfirmFormFooter } from '~/components/Modal'
import { groupFormDefault, groupFormSchema } from '~/schemas/group'

const GroupContent: FC<{
  group: Group
  subscriptions: Subscription[]
  nodes: Node[]
}> = ({ group, subscriptions, nodes }) => {
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
    <Accordion variant="splitted">
      <AccordionItem
        classNames={{ title: 'text-sm' }}
        title={`${t('primitives.node')} (${group.nodes.length})`}
        textValue="node"
      >
        <Select
          classNames={{ trigger: 'py-2' }}
          aria-label="node"
          placeholder={t('primitives.node')}
          variant="bordered"
          isMultiline
          selectionMode="multiple"
          labelPlacement="outside"
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
          }}
          renderValue={(items) => (
            <div className="flex flex-wrap gap-2">
              {items.map((item) => {
                const nodeID = item.textValue!
                const nodeName = item.data?.name

                return (
                  <Chip
                    key={item.key}
                    radius="sm"
                    classNames={{ base: 'max-w-full', content: 'truncate' }}
                    onClose={async () => {
                      await groupDelNodesMutation.mutateAsync({ id: group.id, nodeIDs: [nodeID] })
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
      </AccordionItem>

      <AccordionItem
        classNames={{ title: 'text-sm' }}
        title={`${t('primitives.subscription')} (${group.subscriptions.length})`}
        textValue="subscription"
      >
        <Select
          classNames={{ trigger: 'py-2' }}
          aria-label="subscription"
          variant="bordered"
          placeholder={t('primitives.subscription')}
          isMultiline={true}
          selectionMode="multiple"
          labelPlacement="outside"
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
              await groupDelSubscriptionsMutation.mutateAsync({
                id: group.id,
                subscriptionIDs: subscriptionsToRemove
              })
            }
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
                    await groupDelSubscriptionsMutation.mutateAsync({
                      id: group.id,
                      subscriptionIDs: [item.data!.id]
                    })
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
      </AccordionItem>
    </Accordion>
  )
}

const usePolicies = () => {
  const { t } = useTranslation()

  return [
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
}

const GroupCard: FC<{
  group: Group
  subscriptions: Subscription[]
  nodes: Node[]
}> = ({ group, subscriptions, nodes }) => {
  const { t } = useTranslation()

  const {
    isOpen: isRemoveGroupOpen,
    onOpen: onRemoveGroupOpen,
    onClose: onRemoveGroupClose,
    onOpenChange: onRemoveGroupOpenChange
  } = useDisclosure()

  const policies = usePolicies()

  const groupSetPolicyMutation = useGroupSetPolicyMutation()
  const removeGroupsMutation = useRemoveGroupsMutation()

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <span className="text-lg font-bold">{group.name}</span>

        <div className="flex items-center gap-2">
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <Button color="primary" as="div">
                {group.policy}
              </Button>
            </DropdownTrigger>

            <DropdownMenu
              aria-label="Policy"
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={[group.policy]}
              onSelectionChange={async (selected) => {
                if (selected === 'all') return

                await groupSetPolicyMutation.mutateAsync({
                  id: group.id,
                  policy: Array.from(selected)[0] as Policy,
                  policyParams: []
                })
              }}
            >
              {policies.map((policy) => (
                <DropdownItem key={policy.value} value={policy.value}>
                  {policy.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

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

                  onRemoveGroupClose()
                }}
              />
            </ModalContent>
          </Modal>
        </div>
      </CardHeader>

      <Divider />

      <CardBody>
        <GroupContent group={group} subscriptions={subscriptions} nodes={nodes} />
      </CardBody>
    </Card>
  )
}

export const GroupSection: FC<{ nodes: Node[]; subscriptions: Subscription[] }> = ({ nodes, subscriptions }) => {
  const { t } = useTranslation()

  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose, onOpenChange: onAddOpenChange } = useDisclosure()

  const groupsQuery = useGroupsQuery()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields, isSubmitting }
  } = useForm<z.infer<typeof groupFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(groupFormSchema),
    defaultValues: groupFormDefault
  })
  const createGroupFormDirty = Object.values(dirtyFields).some((dirty) => dirty)

  const createGroupMutation = useCreateGroupMutation()

  const policies = usePolicies()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{t('primitives.group')}</h3>

        <Fragment>
          <Button color="primary" isIconOnly onPress={onAddOpen}>
            <IconPlus />
          </Button>

          <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange}>
            <form
              onSubmit={handleSubmit(async (values) => {
                await createGroupMutation.mutateAsync({
                  name: values.name,
                  policy: values.policy,
                  policyParams: []
                })

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
                    errorMessage={errors.name?.message}
                    {...register('name')}
                  />

                  <Controller
                    name="policy"
                    control={control}
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
                  <Button type="reset" color="secondary" isDisabled={!createGroupFormDirty} onPress={() => reset()}>
                    {t('actions.reset')}
                  </Button>

                  <Button type="submit" color="primary" isLoading={isSubmitting}>
                    {t('actions.confirm')}
                  </Button>
                </ModalFooter>
              </ModalContent>
            </form>
          </Modal>
        </Fragment>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {groupsQuery.data &&
          groupsQuery.data.groups.map((group) => (
            <GroupCard key={group.id} group={group} nodes={nodes} subscriptions={subscriptions} />
          ))}
      </div>
    </div>
  )
}
