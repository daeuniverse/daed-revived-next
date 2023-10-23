import { request } from 'graphql-request'
import { NextResponse } from 'next/server'
import { graphql } from '~/apis/gql'
import { storeJWTAsCookie } from '~/helpers'

export const POST = async (req: Request) => {
  const { username, password } = await req.json()

  const { numberUsers } = await request(
    'http://localhost:3000/api/wing/graphql',
    graphql(`
      query NumberUsers {
        numberUsers
      }
    `)
  )

  if (numberUsers === 0) {
    const { createUser } = await request(
      'http://localhost:3000/api/wing/graphql',
      graphql(`
        mutation CreateUser($username: String!, $password: String!) {
          createUser(username: $username, password: $password)
        }
      `),
      { username, password }
    )

    storeJWTAsCookie(createUser)

    return new NextResponse()
  }

  const { token } = await request(
    'http://localhost:3000/api/wing/graphql',
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
