import { request } from 'graphql-request'
import { NextResponse } from 'next/server'
import { UpdatePasswordMutation } from '~/apis/gql/graphql'
import { updatePasswordMutation } from '~/apis/mutation'
import { decodeJWTFromCookie, storeJWTAsCookie } from '~/helpers'

export const POST = async (req: Request) => {
  const jwtPayload = decodeJWTFromCookie()

  if (!jwtPayload) {
    return new NextResponse(null, { status: 401 })
  }

  const { currentPassword, newPassword } = await req.json()

  const { endpointURL, token } = jwtPayload

  const { updatePassword } = await request<UpdatePasswordMutation>(
    endpointURL,
    updatePasswordMutation,
    { currentPassword, newPassword },
    { Authorization: `Bearer ${token}` }
  )

  storeJWTAsCookie(endpointURL, updatePassword)

  return new NextResponse()
}
