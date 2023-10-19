import { gql, request } from 'graphql-request'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
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

  cookies().set('jwtToken', jwtToken, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    path: '/'
  })

  return new NextResponse().json()
}
