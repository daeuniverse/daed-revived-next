import { useMutation, useQueryClient } from '@tanstack/react-query'
import { graphql } from '~/apis/gql'
import { GlobalInput, ImportArgument, Policy, PolicyParam } from '~/apis/gql/graphql'
import {
  configsQueryKey,
  dnssQueryKey,
  generalQueryKey,
  groupsQueryKey,
  nodesQueryKey,
  routingsQueryKey,
  subscriptionsQueryKey,
  userQueryKey
} from '~/apis/query'
import { useGraphqlClient } from '~/contexts'

export const useCreateConfigMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name, global }: { name?: string; global?: GlobalInput }) => {
      return gqlClient.request(
        graphql(`
          mutation CreateConfig($name: String, $global: globalInput) {
            createConfig(name: $name, global: $global) {
              id
            }
          }
        `),
        {
          name,
          global
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: configsQueryKey })
    }
  })
}

export const useUpdateConfigMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, global }: { id: string; global: GlobalInput }) => {
      return gqlClient.request(
        graphql(`
          mutation UpdateConfig($id: ID!, $global: globalInput!) {
            updateConfig(id: $id, global: $global) {
              id
            }
          }
        `),
        {
          id,
          global
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: configsQueryKey })
      void queryClient.invalidateQueries({ queryKey: generalQueryKey })
    }
  })
}

export const useRemoveConfigMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string }) => {
      return gqlClient.request(
        graphql(`
          mutation RemoveConfig($id: ID!) {
            removeConfig(id: $id)
          }
        `),
        {
          id
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: configsQueryKey })
    }
  })
}

export const useSelectConfigMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string }) => {
      return gqlClient.request(
        graphql(`
          mutation SelectConfig($id: ID!) {
            selectConfig(id: $id)
          }
        `),
        {
          id
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: configsQueryKey })
      void queryClient.invalidateQueries({ queryKey: generalQueryKey })
    }
  })
}

export const useRenameConfigMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => {
      return gqlClient.request(
        graphql(`
          mutation RenameConfig($id: ID!, $name: String!) {
            renameConfig(id: $id, name: $name)
          }
        `),
        {
          id,
          name
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: configsQueryKey })
    }
  })
}

export const useCreateRoutingMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name, routing }: { name?: string; routing?: string }) => {
      return gqlClient.request(
        graphql(`
          mutation CreateRouting($name: String, $routing: String) {
            createRouting(name: $name, routing: $routing) {
              id
            }
          }
        `),
        {
          name,
          routing
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: routingsQueryKey })
    }
  })
}

export const useUpdateRoutingMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, routing }: { id: string; routing: string }) => {
      return gqlClient.request(
        graphql(`
          mutation UpdateRouting($id: ID!, $routing: String!) {
            updateRouting(id: $id, routing: $routing) {
              id
            }
          }
        `),
        {
          id,
          routing
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: routingsQueryKey })
      void queryClient.invalidateQueries({ queryKey: generalQueryKey })
    }
  })
}

export const useRemoveRoutingMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return gqlClient.request(
        graphql(`
          mutation RemoveRouting($id: ID!) {
            removeRouting(id: $id)
          }
        `),
        {
          id
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: routingsQueryKey })
      void queryClient.invalidateQueries({ queryKey: generalQueryKey })
    }
  })
}

export const useSelectRoutingMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string }) => {
      return gqlClient.request(
        graphql(`
          mutation SelectRouting($id: ID!) {
            selectRouting(id: $id)
          }
        `),
        {
          id
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: routingsQueryKey })
      void queryClient.invalidateQueries({ queryKey: generalQueryKey })
    }
  })
}

export const useRenameRoutingMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => {
      return gqlClient.request(
        graphql(`
          mutation RenameRouting($id: ID!, $name: String!) {
            renameRouting(id: $id, name: $name)
          }
        `),
        {
          id,
          name
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: routingsQueryKey })
      void queryClient.invalidateQueries({ queryKey: generalQueryKey })
    }
  })
}

export const useCreateDNSMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name, dns }: { name?: string; dns?: string }) => {
      return gqlClient.request(
        graphql(`
          mutation CreateDNS($name: String, $dns: String) {
            createDns(name: $name, dns: $dns) {
              id
            }
          }
        `),
        {
          name,
          dns
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dnssQueryKey })
    }
  })
}

export const useUpdateDNSMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dns }: { id: string; dns: string }) => {
      return gqlClient.request(
        graphql(`
          mutation UpdateDNS($id: ID!, $dns: String!) {
            updateDns(id: $id, dns: $dns) {
              id
            }
          }
        `),
        {
          id,
          dns
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dnssQueryKey })
      void queryClient.invalidateQueries({ queryKey: generalQueryKey })
    }
  })
}

export const useRemoveDNSMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return gqlClient.request(
        graphql(`
          mutation RemoveDNS($id: ID!) {
            removeDns(id: $id)
          }
        `),
        {
          id
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dnssQueryKey })
    }
  })
}

export const useSelectDNSMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string }) => {
      return gqlClient.request(
        graphql(`
          mutation SelectDNS($id: ID!) {
            selectDns(id: $id)
          }
        `),
        {
          id
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dnssQueryKey })
      void queryClient.invalidateQueries({ queryKey: generalQueryKey })
    }
  })
}

export const useRenameDNSMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => {
      return gqlClient.request(
        graphql(`
          mutation RenameDNS($id: ID!, $name: String!) {
            renameDns(id: $id, name: $name)
          }
        `),
        {
          id,
          name
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dnssQueryKey })
    }
  })
}

export const useCreateGroupMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name, policy, policyParams }: { name: string; policy: Policy; policyParams: PolicyParam[] }) => {
      return gqlClient.request(
        graphql(`
          mutation CreateGroup($name: String!, $policy: Policy!, $policyParams: [PolicyParam!]) {
            createGroup(name: $name, policy: $policy, policyParams: $policyParams) {
              id
            }
          }
        `),
        {
          name,
          policy,
          policyParams
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: groupsQueryKey })
    }
  })
}

export const useRemoveGroupMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return gqlClient.request(
        graphql(`
          mutation RemoveGroup($id: ID!) {
            removeGroup(id: $id)
          }
        `),
        {
          id
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: groupsQueryKey })
    }
  })
}

export const useGroupSetPolicyMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, policy, policyParams }: { id: string; policy: Policy; policyParams: PolicyParam[] }) => {
      return gqlClient.request(
        graphql(`
          mutation GroupSetPolicy($id: ID!, $policy: Policy!, $policyParams: [PolicyParam!]) {
            groupSetPolicy(id: $id, policy: $policy, policyParams: $policyParams)
          }
        `),
        {
          id,
          policy,
          policyParams
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: groupsQueryKey })
      void queryClient.invalidateQueries({ queryKey: generalQueryKey })
    }
  })
}

export const useRenameGroupMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => {
      return gqlClient.request(
        graphql(`
          mutation RenameGroup($id: ID!, $name: String!) {
            renameGroup(id: $id, name: $name)
          }
        `),
        {
          id,
          name
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: groupsQueryKey })
      void queryClient.invalidateQueries({ queryKey: generalQueryKey })
    }
  })
}

export const useGroupAddNodesMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, nodeIDs }: { id: string; nodeIDs: string[] }) => {
      return gqlClient.request(
        graphql(`
          mutation GroupAddNodes($id: ID!, $nodeIDs: [ID!]!) {
            groupAddNodes(id: $id, nodeIDs: $nodeIDs)
          }
        `),
        {
          id,
          nodeIDs
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: groupsQueryKey })
      void queryClient.invalidateQueries({ queryKey: generalQueryKey })
    }
  })
}

export const useGroupDelNodesMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, nodeIDs }: { id: string; nodeIDs: string[] }) => {
      return gqlClient.request(
        graphql(`
          mutation GroupDelNodes($id: ID!, $nodeIDs: [ID!]!) {
            groupDelNodes(id: $id, nodeIDs: $nodeIDs)
          }
        `),
        {
          id,
          nodeIDs
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: groupsQueryKey })
      void queryClient.invalidateQueries({ queryKey: generalQueryKey })
    }
  })
}

export const useGroupAddSubscriptionsMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, subscriptionIDs }: { id: string; subscriptionIDs: string[] }) => {
      return gqlClient.request(
        graphql(`
          mutation GroupAddSubscriptions($id: ID!, $subscriptionIDs: [ID!]!) {
            groupAddSubscriptions(id: $id, subscriptionIDs: $subscriptionIDs)
          }
        `),
        {
          id,
          subscriptionIDs
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: groupsQueryKey })
      void queryClient.invalidateQueries({ queryKey: generalQueryKey })
    }
  })
}

export const useGroupDelSubscriptionsMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, subscriptionIDs }: { id: string; subscriptionIDs: string[] }) => {
      return gqlClient.request(
        graphql(`
          mutation GroupDelSubscriptions($id: ID!, $subscriptionIDs: [ID!]!) {
            groupDelSubscriptions(id: $id, subscriptionIDs: $subscriptionIDs)
          }
        `),
        {
          id,
          subscriptionIDs
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: groupsQueryKey })
      void queryClient.invalidateQueries({ queryKey: generalQueryKey })
    }
  })
}

export const useImportNodesMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ImportArgument[]) => {
      return gqlClient.request(
        graphql(`
          mutation ImportNodes($rollbackError: Boolean!, $args: [ImportArgument!]!) {
            importNodes(rollbackError: $rollbackError, args: $args) {
              link
              error
              node {
                id
              }
            }
          }
        `),
        {
          rollbackError: false,
          args: data
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: nodesQueryKey })
    }
  })
}

export const useRemoveNodesMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => {
      return gqlClient.request(
        graphql(`
          mutation RemoveNodes($ids: [ID!]!) {
            removeNodes(ids: $ids)
          }
        `),
        {
          ids
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: nodesQueryKey })
      void queryClient.invalidateQueries({ queryKey: groupsQueryKey })
      void queryClient.invalidateQueries({ queryKey: configsQueryKey })
    }
  })
}

export const useImportSubscriptionsMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ImportArgument[]) =>
      Promise.all(
        data.map((subscription) =>
          gqlClient.request(
            graphql(`
              mutation ImportSubscription($rollbackError: Boolean!, $arg: ImportArgument!) {
                importSubscription(rollbackError: $rollbackError, arg: $arg) {
                  link
                  sub {
                    id
                  }
                  nodeImportResult {
                    node {
                      id
                    }
                  }
                }
              }
            `),
            {
              rollbackError: false,
              arg: subscription
            }
          )
        )
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subscriptionsQueryKey })
    }
  })
}

export const useUpdateSubscriptionsMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(
        ids.map((id) =>
          gqlClient.request(
            graphql(`
              mutation UpdateSubscription($id: ID!) {
                updateSubscription(id: $id) {
                  id
                }
              }
            `),
            {
              id
            }
          )
        )
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subscriptionsQueryKey })
      void queryClient.invalidateQueries({ queryKey: groupsQueryKey })
      void queryClient.invalidateQueries({ queryKey: generalQueryKey })
    }
  })
}

export const useRemoveSubscriptionsMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) =>
      gqlClient.request(
        graphql(`
          mutation RemoveSubscriptions($ids: [ID!]!) {
            removeSubscriptions(ids: $ids)
          }
        `),
        {
          ids
        }
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subscriptionsQueryKey })
      void queryClient.invalidateQueries({ queryKey: groupsQueryKey })
      void queryClient.invalidateQueries({ queryKey: generalQueryKey })
    }
  })
}

export const useRunMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dry: boolean) => {
      return gqlClient.request(
        graphql(`
          mutation Run($dry: Boolean!) {
            run(dry: $dry)
          }
        `),
        {
          dry
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: generalQueryKey })
    }
  })
}

export const useUpdateAvatarMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (avatar: string) => {
      return gqlClient.request(
        graphql(`
          mutation UpdateAvatar($avatar: String) {
            updateAvatar(avatar: $avatar)
          }
        `),
        {
          avatar
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKey })
    }
  })
}

export const useUpdateNameMutation = () => {
  const gqlClient = useGraphqlClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => {
      return gqlClient.request(
        graphql(`
          mutation UpdateName($name: String) {
            updateName(name: $name)
          }
        `),
        {
          name
        }
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKey })
    }
  })
}
