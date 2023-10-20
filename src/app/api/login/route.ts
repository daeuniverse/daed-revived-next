import { gql, request } from 'graphql-request'
import { NextResponse } from 'next/server'
import { TokenQuery } from '~/apis/gql/graphql'
import { storeJWTAsCookie } from '~/helpers'

export const POST = async (req: Request) => {
  const { endpointURL, username, password } = await req.json()

  const { token } = await request<TokenQuery>(
    endpointURL,
    gql`
      query Token($username: String!, $password: String!) {
        token(username: $username, password: $password)
      }
    `,
    { username, password }
  )

  storeJWTAsCookie(endpointURL, token)

  return new NextResponse()
}
