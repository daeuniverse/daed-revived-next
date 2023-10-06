'use client'

import { ThemeProvider as NextThemesThemeProvider } from 'next-themes'
import { FC, ReactNode } from 'react'
import { TooltipProvider } from '~/components/ui/tooltip'

export const Providers: FC<{ children: ReactNode }> = ({ children }) => (
  <NextThemesThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <TooltipProvider>{children}</TooltipProvider>
  </NextThemesThemeProvider>
)
