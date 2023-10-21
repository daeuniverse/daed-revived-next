import { cn } from '@nextui-org/react'
import { Metadata } from 'next'
import { Noto_Sans_SC, Ubuntu_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import { ReactNode } from 'react'
import { Bootstrap } from './bootstrap'
import { Providers } from './providers'

import '~/styles/globals.css'

const ubuntuMonoFont = Ubuntu_Mono({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek', 'greek-ext'],
  weight: ['400', '700'],
  variable: '--font-ubuntu-mono'
})
const notoSansSCFont = Noto_Sans_SC({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'vietnamese'],
  variable: '--font-noto-sans'
})
const twemojiFont = localFont({
  src: './twemoji.ttf',
  variable: '--font-twemoji',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'daed',
  description: 'A modern dashboard for dae',
  viewport:
    'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(ubuntuMonoFont.variable, notoSansSCFont.variable, twemojiFont.variable)}
    >
      <body>
        <Providers>
          <Bootstrap>
            <main className={cn('min-w-sm mx-auto flex h-screen w-full max-w-screen-xl flex-1 flex-col pb-12')}>
              {children}
            </main>
          </Bootstrap>
        </Providers>
      </body>
    </html>
  )
}
