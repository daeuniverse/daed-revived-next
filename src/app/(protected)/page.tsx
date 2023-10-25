'use client'

import { useState } from 'react'
import { Editor } from '~/components/Editor'

export default function HomePage() {
  const [editorValue, setEditorValue] = useState(
    `
# Hello world

this is a test message
`.trim()
  )

  return (
    <div className="flex flex-col gap-4">
      <Editor height="20vh" language="markdown" value={editorValue} onChange={(value) => setEditorValue(value || '')} />
    </div>
  )
}
