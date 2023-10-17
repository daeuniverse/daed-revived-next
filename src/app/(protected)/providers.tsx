'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { FC, ReactNode } from 'react'
import { GraphqlClientProvider, SessionContextProps, SessionProvider } from '~/contexts'

export const Providers: FC<SessionContextProps & { children: ReactNode }> = ({ endpointURL, token, children }) => (
  <SessionProvider endpointURL={endpointURL} token={token}>
    <GraphqlClientProvider>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } })}>
        {children}

        <ReactQueryDevtools buttonPosition="bottom-right" />
      </QueryClientProvider>
    </GraphqlClientProvider>
  </SessionProvider>
)
