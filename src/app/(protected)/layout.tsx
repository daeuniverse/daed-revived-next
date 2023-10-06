import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { ReactNode } from 'react'
import { Providers } from '~/app/(protected)/providers'
import { Header } from '~/components/Header'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const jwtToken = cookies().get('jwtToken')!.value
  const { endpointURL, token } = jwt.decode(jwtToken, { json: true })!

  return (
    <Providers endpointURL={endpointURL} token={token}>
      <div className="sticky inset-x-0 top-0">
        <Header />
      </div>

      <section className="p-2 sm:p-4">{children}</section>
    </Providers>
  )
}
