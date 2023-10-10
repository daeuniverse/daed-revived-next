import { FC, ReactNode } from 'react'

export const ResourcePage: FC<{ name: string; creation?: ReactNode; children: ReactNode }> = ({
  name,
  creation,
  children
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{name}</h2>

        {creation}
      </div>

      {children}
    </div>
  )
}
