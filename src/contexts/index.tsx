'use client'

import { ClientError, GraphQLClient } from 'graphql-request'
import { useRouter } from 'next/navigation'
import { FC, ReactNode, createContext, useContext, useMemo } from 'react'

const GraphqlClientContext = createContext<GraphQLClient>(null as unknown as GraphQLClient)

export const useGraphqlClient = () => useContext(GraphqlClientContext)

export const GraphqlClientProvider: FC<{ endpointURL: string; token: string; children: ReactNode }> = ({
  endpointURL,
  token,
  children
}) => {
  const router = useRouter()

  const graphqlClient = useMemo(
    () =>
      new GraphQLClient(endpointURL, {
        headers: { Authorization: `Bearer ${token}` },
        responseMiddleware: (response) => {
          const error = (response as ClientError).response?.errors?.[0]

          if (error?.message === 'access denied') {
            router.replace('/setup')
          }

          return response
        }
      }),
    [endpointURL, token, router]
  )

  return <GraphqlClientContext.Provider value={graphqlClient}>{children}</GraphqlClientContext.Provider>
}
