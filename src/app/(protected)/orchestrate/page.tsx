'use client'

import { useTranslation } from 'react-i18next'
import { ResourcePage } from '~/components/ResourcePage'

export default function OrchestratePage() {
  const { t } = useTranslation()

  return <ResourcePage name={t('primitives.orchestrate')}>hello world</ResourcePage>
}
