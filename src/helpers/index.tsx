import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export const randomUnsplashImageURL = (sig: string, width: number, height: number) =>
  `https://source.unsplash.com/random/${width}x${height}?goose&sig=${sig}`

export const decodeJWTFromCookie = () => {
  const jwtToken = cookies().get('jwtToken')

  if (!jwtToken) return null

  return jwt.decode(jwtToken.value, { json: true })! as { token: string }
}

export const storeJWTAsCookie = (token: string) => {
  const jwtToken = jwt.sign({ token }, process.env.NEXT_PUBLIC_JWT_SECRET!)

  cookies().set('jwtToken', jwtToken, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    path: '/'
  })
}
