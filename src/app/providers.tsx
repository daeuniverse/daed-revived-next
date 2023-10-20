'use client'

import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider, useTheme } from 'next-themes'
import { FC, ReactNode } from 'react'
import { Toaster } from 'sonner'

const ToasterProvider = () => {
  const { theme } = useTheme()

  return <Toaster theme={theme as 'system' | 'light' | 'dark'} closeButton />
}

export const Providers: FC<{ children: ReactNode }> = ({ children }) => (
  <NextUIProvider>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}

      <ToasterProvider />
    </ThemeProvider>
  </NextUIProvider>
)
