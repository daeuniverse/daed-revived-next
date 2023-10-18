import { FC } from 'react'

export const Description: FC<{ children: string }> = ({ children }) => {
  return <p className="text-tiny text-foreground-400">{children}</p>
}
