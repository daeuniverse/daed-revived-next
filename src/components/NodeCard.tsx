import { Card, CardBody, CardFooter, CardHeader, Tooltip } from '@nextui-org/react'
import { FC } from 'react'
import { Node } from '~/apis/gql/graphql'
import { RandomUnsplashImage } from '~/components/RandomUnsplashImage'

export const NodeCard: FC<{ node: Node }> = ({ node }) => (
  <Tooltip content={node.tag || node.name}>
    <Card shadow="sm" isPressable>
      <CardHeader className="block truncate text-center">{node.tag || node.name}</CardHeader>

      <CardBody className="px-2 py-0">
        <RandomUnsplashImage sig={node.id} />
      </CardBody>

      <CardFooter>{node.protocol}</CardFooter>
    </Card>
  </Tooltip>
)
