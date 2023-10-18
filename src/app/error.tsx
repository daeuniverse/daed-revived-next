'use client'

import { IconRefresh } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/Button'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslation()

  return (
    <div className="container flex h-screen flex-col items-center justify-center gap-4">
      <div className="text-center font-bold">{error.message}</div>

      <Button onPress={() => reset()} startContent={<IconRefresh />}>
        {t('actions.refresh')}
      </Button>
    </div>
  )
}
