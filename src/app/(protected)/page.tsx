'use client'

import RiveComponent from '@rive-app/react-canvas'
import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { useState } from 'react'
import { UserQuery } from '~/apis/gql/graphql'
import { Editor } from '~/components/Editor'
import { useGraphqlClient } from '~/contexts'

export default function HomePage() {
  const graphqlClient = useGraphqlClient()
  const userQuery = useQuery<UserQuery>({
    queryKey: ['user'],
    queryFn: () =>
      graphqlClient.request(gql`
        query User {
          user {
            username
            name
            avatar
          }
        }
      `)
  })

  const [editorValue, setEditorValue] = useState(
    `
# Hello world

this is a test message
`.trim()
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-2">
        <RiveComponent src="/3890-8146-moon-scan.riv" className="h-80 w-80" />
        <RiveComponent src="/569-6666-blue-planet.riv" className="h-80 w-80" />
      </div>

      <p>Name: {userQuery.data?.user.name}</p>
      <p>Username: {userQuery.data?.user.username}</p>

      <Editor height="20vh" language="markdown" value={editorValue} onChange={(value) => setEditorValue(value || '')} />
    </div>
  )
}
