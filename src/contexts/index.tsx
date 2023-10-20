'use client'

import { ClientError, GraphQLClient } from 'graphql-request'
import { useRouter } from 'next/navigation'
import { FC, ReactNode, createContext, useContext, useMemo } from 'react'
import { toast } from 'sonner'

export type SessionContextProps = { endpointURL: string; token: string }

const SessionContext = createContext<SessionContextProps>(null as unknown as { endpointURL: string; token: string })

export const useSession = () => useContext(SessionContext)

export const SessionProvider: FC<SessionContextProps & { children: ReactNode }> = ({
  endpointURL,
  token,
  children
}) => {
  const router = useRouter()

  if (!endpointURL || !token) {
    router.replace('/login')

    return null
  }

  return <SessionContext.Provider value={{ endpointURL, token }}>{children}</SessionContext.Provider>
}

const GraphqlClientContext = createContext<GraphQLClient>(null as unknown as GraphQLClient)

export const useGraphqlClient = () => useContext(GraphqlClientContext)

export const GraphqlClientProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter()
  const { endpointURL, token } = useSession()

  const graphqlClient = useMemo(
    () =>
      new GraphQLClient(endpointURL, {
        headers: { Authorization: `Bearer ${token}` },
        responseMiddleware: (response) => {
          const error = (response as ClientError).response?.errors?.[0]

          if (!error) {
            return response
          }

          if (error.message === 'access denied') {
            router.replace('/login')
          } else {
            toast.error(error?.message)
          }
        }
      }),
    [endpointURL, token, router]
  )

  return <GraphqlClientContext.Provider value={graphqlClient}>{children}</GraphqlClientContext.Provider>
}
