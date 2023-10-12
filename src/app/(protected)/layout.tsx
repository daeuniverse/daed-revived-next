import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import { Providers } from '~/app/(protected)/providers'
import { Header } from '~/components/Header'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const jwtToken = cookies().get('jwtToken')

  if (!jwtToken) {
    redirect('/login')
  }

  const { endpointURL, token } = jwt.decode(jwtToken.value, { json: true })!

  return (
    <Providers endpointURL={endpointURL} token={token}>
      <Header />

      <section className="flex-1 overflow-y-auto p-2 sm:p-4">{children}</section>
    </Providers>
  )
}
