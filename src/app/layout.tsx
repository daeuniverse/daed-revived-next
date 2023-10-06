import '~/app/globals.css'

import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import { Bootstrap } from '~/app/bootstrap'
import { Providers } from '~/app/providers'
import { Toaster } from '~/components/ui/toaster'
import { cn } from '~/lib/ui'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = { title: 'daed', description: 'daed' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className)}>
        <Providers>
          <Bootstrap>
            <main
              className={cn(
                'relative mx-auto box-border flex h-screen w-full min-w-sm max-w-screen-xl flex-1 flex-col overflow-y-auto overflow-x-hidden'
              )}
            >
              {children}
            </main>
          </Bootstrap>

          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
