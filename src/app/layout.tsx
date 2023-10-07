import '~/app/globals.css'

import { Metadata } from 'next'
import { Noto_Sans_SC } from 'next/font/google'
import { ReactNode } from 'react'
import { Bootstrap } from '~/app/bootstrap'
import { Providers } from '~/app/providers'
import { Toaster } from '~/components/ui/toaster'
import { cn } from '~/lib/ui'

const notoSansSC = Noto_Sans_SC({ subsets: ['latin', 'latin-ext', 'cyrillic', 'vietnamese'] })

export const metadata: Metadata = {
  title: 'daed',
  description: 'A modern dashboard for dae',
  viewport:
    'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(notoSansSC.className)}>
        <Providers>
          <Bootstrap>
            <main
              className={cn(
                'relative mx-auto box-border flex h-screen w-full min-w-sm max-w-screen-xl flex-1 flex-col overflow-y-auto'
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
