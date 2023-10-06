'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { FC, ReactNode } from 'react'
import { GraphqlClientProvider } from '~/contexts'

export const Providers: FC<{ endpointURL: string; token: string; children: ReactNode }> = ({
  endpointURL,
  token,
  children
}) => (
  <GraphqlClientProvider endpointURL={endpointURL} token={token}>
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { refetchOnWindowFocus: false, useErrorBoundary: true },
            mutations: { useErrorBoundary: true }
          }
        })
      }
    >
      {children}

      <ReactQueryDevtools position="bottom-right" />
    </QueryClientProvider>
  </GraphqlClientProvider>
)
