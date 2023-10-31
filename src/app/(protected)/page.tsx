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
      <h1 className="py-12 text-center text-9xl font-semibold">daed</h1>

      <Editor height="20vh" language="markdown" value={editorValue} onChange={(value) => setEditorValue(value || '')} />
    </div>
  )
}
