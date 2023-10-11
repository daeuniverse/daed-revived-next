'use client'

import { useTranslation } from 'react-i18next'
import { useGroupsQuery, useNodesQuery, useSubscriptionsQuery } from '~/apis/query'
import { ResourcePage } from '~/components/ResourcePage'

export default function OrchestratePage() {
  const { t } = useTranslation()
  const groupsQuery = useGroupsQuery()
  const subscriptionsQuery = useSubscriptionsQuery()
  const nodesQuery = useNodesQuery()

  return (
    <ResourcePage name={t('primitives.orchestrate')}>
      <div className="grid grid-cols-2 gap-2 break-all">
        <div className="col-span-2 flex flex-col gap-2 rounded-lg border border-primary p-4">
          <h3 className="text-xl font-bold">{t('primitives.group')}</h3>

          <div className="flex flex-col gap-1">
            {groupsQuery.data?.groups.map((group) => (
              <div key={group.id} className="rounded border border-accent p-2">
                {group.name}
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-2 rounded-lg border border-primary p-4 sm:col-span-1">
          <h3 className="text-xl font-bold">{t('primitives.subscription')}</h3>

          <div className="flex flex-col gap-1">
            {subscriptionsQuery.data?.subscriptions.map((subscription) => (
              <div key={subscription.id} className="rounded border border-accent p-1">
                <h4 className="p-4 text-center text-lg">
                  {subscription.tag} :: {subscription.updatedAt}
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  {subscription.nodes.edges.map((node) => (
                    <div key={node.id} className="flex flex-col gap-1 rounded border border-accent p-2">
                      <span>{node.name}</span>
                      <span className="uppercase">{node.protocol}</span>
                      <span>{node.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-2 rounded-lg border border-primary p-4 sm:col-span-1">
          <h3 className="text-xl font-bold">{t('primitives.node')}</h3>

          <div className="flex flex-col gap-1">
            {nodesQuery.data?.nodes.edges.map((node) => (
              <div key={node.id} className="rounded border border-accent p-2">
                {node.address}
                <br />
                {node.id}
                <br />
                {node.subscriptionID}
                <br />
                {node.protocol} :: {node.tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ResourcePage>
  )
}
