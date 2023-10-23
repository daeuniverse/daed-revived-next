import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import { Header } from '~/components/Header'
import { decodeJWTFromCookie } from '~/helpers'
import { Providers } from './providers'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const jwtPayload = decodeJWTFromCookie()

  if (!jwtPayload) redirect('/login')

  const { token } = jwtPayload

  return (
    <Providers token={token}>
      <Header />

      <section className="flex-1 overflow-y-auto p-2 sm:p-4">{children}</section>
    </Providers>
  )
}
