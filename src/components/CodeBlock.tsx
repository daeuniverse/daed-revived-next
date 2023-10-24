'use client'

import { useTheme } from 'next-themes'
import { FC } from 'react'
import SyntaxHighlighter, { SyntaxHighlighterProps } from 'react-syntax-highlighter'
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'

const CodeBlock: FC<{ children: string } & SyntaxHighlighterProps> = ({ children, ...props }) => {
  const { resolvedTheme } = useTheme()

  return (
    <div className="overflow-hidden rounded-lg">
      <SyntaxHighlighter style={resolvedTheme === 'dark' ? atomOneDark : atomOneLight} {...props}>
        {children}
      </SyntaxHighlighter>
    </div>
  )
}
CodeBlock.displayName = 'CodeBlock'

export { CodeBlock }
