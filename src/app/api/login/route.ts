import { request } from 'graphql-request'
import { NextResponse } from 'next/server'
import { graphql } from '~/apis/gql'
import { storeJWTAsCookie } from '~/helpers'

export const POST = async (req: Request) => {
  const { endpointURL, username, password } = await req.json()

  const { numberUsers } = await request(
    endpointURL,
    graphql(`
      query NumberUsers {
        numberUsers
      }
    `)
  )

  if (numberUsers === 0) {
    const { createUser } = await request(
      endpointURL,
      graphql(`
        mutation CreateUser($username: String!, $password: String!) {
          createUser(username: $username, password: $password)
        }
      `),
      { username, password }
    )

    storeJWTAsCookie(endpointURL, createUser)

    return new NextResponse()
  }

  const { token } = await request(
    endpointURL,
    graphql(`
      query Token($username: String!, $password: String!) {
        token(username: $username, password: $password)
      }
    `),
    { username, password }
  )

  storeJWTAsCookie(endpointURL, token)

  return new NextResponse()
}
