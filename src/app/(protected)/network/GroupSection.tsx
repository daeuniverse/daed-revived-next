'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Accordion,
  AccordionItem,
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
import { createGroupFormDefault, createGroupFormSchema } from '~/schemas/group'

const GroupContent: FC<{
  group: Group
  subscriptions: Subscription[]
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

const GroupAccordion: FC<{
  group: Group
  subscriptions: Subscription[]
  nodes: Node[]
  refetch: () => Promise<unknown>
}> = ({ group, refetch, subscriptions, nodes }) => {
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
    <Accordion key={group.id} variant="shadow">
      <AccordionItem
        title={group.name}
        startContent={
          <div className="flex items-center gap-2">
            <Dropdown>
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
                  if (selected === 'all') {
                    return
                  }

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
                    await refetch()

                    onRemoveGroupClose()
                  }}
                />
              </ModalContent>
            </Modal>
          </div>
        }
      >
        <GroupContent group={group} subscriptions={subscriptions} nodes={nodes} refetch={refetch} />
      </AccordionItem>
    </Accordion>
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
  } = useForm<z.infer<typeof createGroupFormSchema>>({
    shouldFocusError: true,
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: createGroupFormDefault
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

      {groupsQuery.data &&
        groupsQuery.data.groups.map((group) => (
          <GroupAccordion
            key={group.id}
            group={group}
            refetch={groupsQuery.refetch}
            nodes={nodes}
            subscriptions={subscriptions}
          />
        ))}
    </div>
  )
}
