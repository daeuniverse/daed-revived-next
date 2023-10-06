import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import { Providers } from '~/app/(protected)/providers'
import { Header } from '~/components/Header'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const jwtToken = cookies().get('jwtToken')

  if (!jwtToken) {
    redirect('/setup')
  }

  const { endpointURL, token } = jwt.decode(jwtToken.value, { json: true })!

  return (
    <Providers endpointURL={endpointURL} token={token}>
      <div className="sticky inset-x-0 top-0">
        <Header />
      </div>

      <section className="p-2 sm:p-4">{children}</section>
    </Providers>
  )
}
