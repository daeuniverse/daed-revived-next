'use client'

import { ClientError, GraphQLClient } from 'graphql-request'
import { useRouter } from 'next/navigation'
import { FC, ReactNode, createContext, useContext, useMemo } from 'react'
import { toast } from 'sonner'

export type SessionContextProps = { token: string }

const SessionContext = createContext<SessionContextProps>(null as unknown as { token: string })

export const useSession = () => useContext(SessionContext)

export const SessionProvider: FC<SessionContextProps & { children: ReactNode }> = ({ token, children }) => {
  const router = useRouter()

  if (!token) {
    router.replace('/login')

    return null
  }

  return <SessionContext.Provider value={{ token }}>{children}</SessionContext.Provider>
}

const GraphqlClientContext = createContext<GraphQLClient>(null as unknown as GraphQLClient)

export const useGraphqlClient = () => useContext(GraphqlClientContext)

export const GraphqlClientProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter()
  const { token } = useSession()

  const graphqlClient = useMemo(
    () =>
      new GraphQLClient('/api/wing/graphql', {
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
    [token, router]
  )

  return <GraphqlClientContext.Provider value={graphqlClient}>{children}</GraphqlClientContext.Provider>
}
