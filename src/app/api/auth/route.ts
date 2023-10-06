import { gql, request } from 'graphql-request'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { TokenQuery } from '~/apis/gql/graphql'

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

  const jwtToken = jwt.sign({ endpointURL, token }, process.env.NEXT_PUBLIC_JWT_SECRET!)

  const cookieMaxAge = 60 * 60 * 24 * 30 // 30 days

  return NextResponse.json(
    { token },
    {
      headers: {
        'Set-Cookie': `jwtToken=${jwtToken}; endpointURL=${endpointURL}; Max-Age=${cookieMaxAge}; Path=/; HttpOnly`
      }
    }
  )
}
