'use client'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { FC, ReactNode, useState } from 'react'
import { useAsync } from 'react-use'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import { initializeEditor } from '~/editor'
import { initializeI18n } from '~/i18n'

export const Bootstrap: FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true)

  useAsync(async () => {
    setLoading(true)

    dayjs.extend(duration)
    await initializeI18n()
    await initializeEditor()

    setLoading(false)
  })

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-1 flex-col items-center justify-center gap-4">
        <LoadingSpinner />

        <span>Loading assets...</span>
      </div>
    )
  }

  return children
}
