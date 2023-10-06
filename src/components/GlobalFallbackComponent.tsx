'use client'

import { RefreshCwIcon } from 'lucide-react'
import { FC } from 'react'
import { FallbackProps } from 'react-error-boundary'
import { Button } from '~/components/ui/button'

const GlobalFallbackComponent: FC<FallbackProps> = ({ error, resetErrorBoundary }) => (
  <div className="container flex h-screen flex-col items-center justify-center gap-4">
    <div className="text-center font-bold">{error.message}</div>

    <Button className="gap-2" onClick={() => resetErrorBoundary()}>
      <RefreshCwIcon className="w-4" />
      Refresh
    </Button>
  </div>
)
GlobalFallbackComponent.displayName = 'GlobalFallbackComponent'

export { GlobalFallbackComponent }
