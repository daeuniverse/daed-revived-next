import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import { Providers } from '~/app/(protected)/providers'
import { Header } from '~/components/Header'
import { decodeJWTFromCookie } from '~/helpers'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const jwtPayload = decodeJWTFromCookie()

  if (!jwtPayload) redirect('/login')

  const { endpointURL, token } = jwtPayload

  return (
    <Providers endpointURL={endpointURL} token={token}>
      <Header />

      <section className="flex-1 overflow-y-auto p-2 sm:p-4">{children}</section>
    </Providers>
  )
}
