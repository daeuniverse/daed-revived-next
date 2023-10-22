'use client'

import { useTranslation } from 'react-i18next'
import { useNodesQuery, useSubscriptionsQuery } from '~/apis/query'
import { GroupSection } from '~/app/(protected)/network/GroupSection'
import { NodeSection } from '~/app/(protected)/network/NodeSection'
import { SubscriptionSection } from '~/app/(protected)/network/SubscriptionSection'
import { ResourcePage } from '~/components/ResourcePage'

export default function NetworkPage() {
  const { t } = useTranslation()

  const subscriptionsQuery = useSubscriptionsQuery()
  const nodesQuery = useNodesQuery()

  return (
    <ResourcePage name={t('primitives.network')}>
      <div className="flex flex-col gap-8">
        <GroupSection
          nodes={nodesQuery.data?.nodes.edges || []}
          subscriptions={subscriptionsQuery.data?.subscriptions || []}
        />

        <NodeSection nodes={nodesQuery.data?.nodes.edges || []} isLoading={nodesQuery.isLoading} />

        <SubscriptionSection subscriptions={subscriptionsQuery.data?.subscriptions || []} />
      </div>
    </ResourcePage>
  )
}
