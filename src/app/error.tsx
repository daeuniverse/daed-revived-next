'use client'

import { RefreshCwIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container flex h-screen flex-col items-center justify-center gap-4">
      <div className="text-center font-bold">{error.message}</div>

      <Button className="gap-2" onClick={() => reset()}>
        <RefreshCwIcon className="w-4" />
        Refresh
      </Button>
    </div>
  )
}
