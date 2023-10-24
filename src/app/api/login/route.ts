import { GraphQLClient, request } from 'graphql-request'
import { NextResponse } from 'next/server'
import { graphql } from '~/apis/gql'
import {
  createConfigMutation,
  createDNSMutation,
  createGroupMutation,
  createRoutingMutation,
  selectConfigMutation,
  selectDNSMutation,
  selectRoutingMutation,
  setJsonStorageMutation
} from '~/apis/mutation'
import { storeJWTAsCookie } from '~/helpers'
import { configFormDefault } from '~/schemas/config'
import { DNSFormDefault } from '~/schemas/dns'
import { groupFormDefault } from '~/schemas/group'
import { routingFormDefault } from '~/schemas/routing'

const apiURL = 'http://localhost:3000/api/wing/graphql'

const getDefaults = async <T extends ArrayLike<string>>(requestClient: GraphQLClient, paths: string[]) => {
  const { jsonStorage } = await requestClient.request(
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

const setJsonStorage = (requestClient: GraphQLClient, object: Record<string, string>) => {
  const paths = Object.keys(object)
  const values = paths.map((path) => object[path])

  return requestClient.request(setJsonStorageMutation, {
    paths,
    values
  })
}

const initialize = async (token: string) => {
  const requestClient = new GraphQLClient(apiURL, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const { defaultConfigID, defaultRoutingID, defaultDNSID, defaultGroupID } = await getDefaults(requestClient, [
    'defaultConfigID',
    'defaultDNSID',
    'defaultGroupID',
    'defaultRoutingID'
  ])

  if (!defaultConfigID) {
    const {
      createConfig: { id }
    } = await requestClient.request(createConfigMutation, {
      name: 'global',
      global: configFormDefault
    })

    await requestClient.request(selectConfigMutation, { id })
    await setJsonStorage(requestClient, { defaultConfigID: id })
  }

  if (!defaultRoutingID) {
    const {
      createRouting: { id }
    } = await requestClient.request(createRoutingMutation, { ...routingFormDefault, name: 'routing' })

    await requestClient.request(selectRoutingMutation, { id })
    await setJsonStorage(requestClient, { defaultRoutingID: id })
  }

  if (!defaultDNSID) {
    const {
      createDns: { id }
    } = await requestClient.request(createDNSMutation, { ...DNSFormDefault, name: 'dns' })

    await requestClient.request(selectDNSMutation, { id })
    await setJsonStorage(requestClient, { defaultDNSID: id })
  }

  if (!defaultGroupID) {
    const {
      createGroup: { id }
    } = await requestClient.request(createGroupMutation, {
      ...groupFormDefault,
      name: 'proxy'
    })
    await setJsonStorage(requestClient, { defaultGroupID: id })
  }
}

export const POST = async (req: Request) => {
  const { username, password } = await req.json()

  const { numberUsers } = await request(
    apiURL,
    graphql(`
      query NumberUsers {
        numberUsers
      }
    `)
  )

  // If there are no users, create one
  // and initialize the default config, routing, dns, and group
  if (numberUsers === 0) {
    const { createUser } = await request(
      apiURL,
      graphql(`
        mutation CreateUser($username: String!, $password: String!) {
          createUser(username: $username, password: $password)
        }
      `),
      { username, password }
    )

    await initialize(createUser)

    storeJWTAsCookie(createUser)

    return new NextResponse()
  }

  const { token } = await request(
    apiURL,
    graphql(`
      query Token($username: String!, $password: String!) {
        token(username: $username, password: $password)
      }
    `),
    { username, password }
  )

  storeJWTAsCookie(token)

  return new NextResponse()
}
