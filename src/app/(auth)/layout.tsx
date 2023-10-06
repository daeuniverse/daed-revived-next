import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = { title: 'daed' }

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children
}
