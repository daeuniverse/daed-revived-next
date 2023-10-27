'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { FC, ReactNode } from 'react'
import { GraphqlClientProvider, SessionContextProps, SessionProvider } from '~/contexts'

export const Providers: FC<SessionContextProps & { children: ReactNode }> = ({ token, children }) => (
  <SessionProvider token={token}>
    <GraphqlClientProvider>
      <QueryClientProvider client={new QueryClient()}>
        {children}

        <ReactQueryDevtools />
      </QueryClientProvider>
    </GraphqlClientProvider>
  </SessionProvider>
)
