'use client'

import { PlusIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useGroupsQuery, useNodesQuery, useSubscriptionsQuery } from '~/apis/query'
import { NodeCard } from '~/components/NodeCard'
import { ResourcePage } from '~/components/ResourcePage'
import { TagsInput } from '~/components/TagsInput'
import { Button } from '~/components/ui/button'

export default function OrchestratePage() {
  const { t } = useTranslation()
  const groupsQuery = useGroupsQuery()
  const subscriptionsQuery = useSubscriptionsQuery()
  const nodesQuery = useNodesQuery()

  return (
    <ResourcePage name={t('primitives.orchestrate')}>
      <div className="grid grid-cols-2 gap-2 break-all">
        <div className="col-span-2 flex flex-col gap-2 rounded-lg border border-primary p-2">
          <div className="flex items-center justify-between rounded border border-secondary p-2">
            <h3 className="text-xl font-bold">{t('primitives.group')}</h3>

            <Button size="icon" icon={<PlusIcon className="w-4" />} />
          </div>

          <div className="flex flex-col gap-1">
            {groupsQuery.data?.groups.map((group) => (
              <div key={group.id} className="border-accent flex flex-col gap-2 rounded border p-2">
                {group.name}

                <TagsInput
                  value={group.nodes.map((node) => node.tag || node.name)}
                  options={nodesQuery.data?.nodes.edges.map((node) => ({ value: node.tag || node.name })) || []}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-2 rounded-lg border border-primary p-4 sm:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{t('primitives.subscription')}</h3>

            <Button size="icon" icon={<PlusIcon className="w-4" />} />
          </div>

          <div className="flex flex-col gap-1">
            {subscriptionsQuery.data?.subscriptions.map((subscription) => (
              <div key={subscription.id} className="border-accent rounded border p-1">
                <h4 className="p-4 text-center text-lg">
                  {subscription.tag} :: {subscription.updatedAt}
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  {subscription.nodes.edges.map((node) => (
                    <NodeCard key={node.id} node={node} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-2 rounded-lg border border-primary p-4 sm:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{t('primitives.node')}</h3>
            <Button size="icon" icon={<PlusIcon className="w-4" />} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {nodesQuery.data?.nodes.edges.map((node) => <NodeCard key={node.id} node={node} />)}
          </div>
        </div>
      </div>
    </ResourcePage>
  )
}
