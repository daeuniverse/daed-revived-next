import { Metadata } from 'next'
import { Fira_Code, Noto_Sans_SC } from 'next/font/google'
import { ReactNode } from 'react'
import { Bootstrap } from '~/app/bootstrap'
import { Providers } from '~/app/providers'
import { Toaster } from '~/components/ui/toaster'
import { cn } from '~/lib/ui'

import '~/app/globals.css'

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'vietnamese'],
  variable: '--font-noto-sans'
})
const firaCode = Fira_Code({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek', 'greek-ext'],
  variable: '--font-fira-code'
})

export const metadata: Metadata = {
  title: 'daed',
  description: 'A modern dashboard for dae',
  viewport:
    'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(firaCode.variable, notoSansSC.variable)}>
      <body>
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
