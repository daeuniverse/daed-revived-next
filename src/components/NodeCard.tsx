import { FC } from 'react'
import { Node } from '~/apis/gql/graphql'

export const NodeCard: FC<{ node: Node }> = ({ node }) => {
  return (
    <div className="flex flex-col gap-1 rounded border border-accent p-2">
      <span>{node.name}</span>
      <span className="uppercase">{node.protocol}</span>
      <span>{node.id}</span>
    </div>
  )
}
