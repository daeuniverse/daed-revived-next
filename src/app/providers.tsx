'use client'

import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider } from 'next-themes'
import { FC, ReactNode } from 'react'

export const Providers: FC<{ children: ReactNode }> = ({ children }) => (
  <NextUIProvider>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  </NextUIProvider>
)
