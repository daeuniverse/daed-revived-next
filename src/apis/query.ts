import { useQuery } from '@tanstack/react-query'
import { graphql } from '~/apis/gql/gql'
import { useGraphqlClient } from '~/contexts'

export const useGetJSONStorageRequest = <T extends ArrayLike<string>>(paths: T) => {
  const gqlClient = useGraphqlClient()

  return useQuery({
    queryKey: ['jsonStorage', paths],
    queryFn: async () => {
      const { jsonStorage } = await gqlClient.request(
        graphql(`
          query JsonStorage($paths: [String!]) {
            jsonStorage(paths: $paths)
          }
        `),
        { paths: paths as unknown as string[] }
      )

      return jsonStorage.reduce(
        (prev, cur, index) => ({ ...prev, [paths[index]]: cur }),
        {} as { [key in T[number]]: (typeof jsonStorage)[number] }
      )
    }
  })
}

export const useDefaultResourcesQuery = () =>
  useGetJSONStorageRequest(['defaultConfigID', 'defaultDNSID', 'defaultGroupID', 'defaultRoutingID'] as const)

export const generalQueryKey = ['general']
export const useGeneralQuery = () => {
  const gqlClient = useGraphqlClient()

  return useQuery({
    queryKey: generalQueryKey,
    queryFn: () =>
      gqlClient.request(
        graphql(`
          query General($interfacesUp: Boolean) {
            general {
              dae {
                running
                modified
                version
              }

              interfaces(up: $interfacesUp) {
                name
                ifindex
                ip
                flag {
                  default {
                    ipVersion
                    gateway
                    source
                  }
                }
              }
            }
          }
        `),
        { interfacesUp: true }
      )
  })
}

export const nodesQueryKey = ['nodes']

export const useNodesQuery = () => {
  const gqlClient = useGraphqlClient()

  return useQuery({
    queryKey: nodesQueryKey,
    queryFn: () =>
      gqlClient.request(
        graphql(`
          query Nodes {
            nodes {
              edges {
                id
                name
                link
                address
                protocol
                tag
              }
            }
          }
        `)
      )
  })
}

export const subscriptionsQueryKey = ['subscriptions']

export const useSubscriptionsQuery = () => {
  const gqlClient = useGraphqlClient()

  return useQuery({
    queryKey: subscriptionsQueryKey,
    queryFn: () =>
      gqlClient.request(
        graphql(`
          query Subscriptions {
            subscriptions {
              id
              tag
              status
              link
              info
              updatedAt
              nodes {
                edges {
                  id
                  name
                  protocol
                  link
                }
              }
            }
          }
        `)
      )
  })
}

export const configsQueryKey = ['configs']

export const useConfigsQuery = () => {
  const gqlClient = useGraphqlClient()

  return useQuery({
    queryKey: configsQueryKey,
    queryFn: () =>
      gqlClient.request(
        graphql(`
          query Configs {
            configs {
              id
              name
              selected
              global {
                logLevel
                tproxyPort
                allowInsecure
                checkInterval
                checkTolerance
                lanInterface
                wanInterface
                udpCheckDns
                tcpCheckUrl
                dialMode
                tcpCheckHttpMethod
                disableWaitingNetwork
                autoConfigKernelParameter
                sniffingTimeout
                tlsImplementation
                utlsImitate
                tproxyPortProtect
                soMarkFromDae
              }
            }
          }
        `)
      )
  })
}

export const groupsQueryKey = ['groups']

export const useGroupsQuery = () => {
  const gqlClient = useGraphqlClient()

  return useQuery({
    queryKey: groupsQueryKey,
    queryFn: () =>
      gqlClient.request(
        graphql(`
          query Groups {
            groups {
              id
              name
              nodes {
                id
                link
                name
                address
                protocol
                tag
                subscriptionID
              }
              subscriptions {
                id
                updatedAt
                tag
                link
                status
                info

                nodes {
                  edges {
                    id
                    link
                    name
                    address
                    protocol
                    tag
                    subscriptionID
                  }
                }
              }
              policy
              policyParams {
                key
                val
              }
            }
          }
        `)
      )
  })
}

export const routingsQueryKey = ['rules']

export const useRoutingsQuery = () => {
  const gqlClient = useGraphqlClient()

  return useQuery({
    queryKey: routingsQueryKey,
    queryFn: () =>
      gqlClient.request(
        graphql(`
          query Routings {
            routings {
              id
              name
              selected
              routing {
                string
              }
            }
          }
        `)
      )
  })
}

export const dnssQueryKey = ['dnss']

export const useDNSsQuery = () => {
  const gqlClient = useGraphqlClient()

  return useQuery({
    queryKey: dnssQueryKey,
    queryFn: () =>
      gqlClient.request(
        graphql(`
          query DNSs {
            dnss {
              id
              name
              dns {
                string

                routing {
                  request {
                    string
                  }
                  response {
                    string
                  }
                }
              }
              selected
            }
          }
        `)
      )
  })
}

export const userQueryKey = ['user']

export const useUserQuery = () => {
  const gqlClient = useGraphqlClient()

  return useQuery({
    queryKey: userQueryKey,
    queryFn: () =>
      gqlClient.request(
        graphql(`
          query User {
            user {
              username
              name
              avatar
            }
          }
        `)
      )
  })
}
