import { FC, ReactNode } from 'react'

export const Label: FC<{ children: ReactNode }> = ({ children }) => (
  <label className="block cursor-text text-tiny font-medium text-foreground-600">{children}</label>
)
