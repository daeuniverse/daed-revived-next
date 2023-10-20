import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const POST = () => {
  cookies().delete('jwtToken')

  return new NextResponse()
}
