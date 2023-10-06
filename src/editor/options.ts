import { EditorProps } from '@monaco-editor/react'

export const themeDark = 'vs-dark'
export const themeLight = 'githubLight'

export const options: EditorProps['options'] = {
  cursorBlinking: 'solid',
  folding: false,
  fontFamily: 'Source Code Pro',
  fontSize: 14,
  fontWeight: 'bold',
  formatOnPaste: true,
  glyphMargin: false,
  insertSpaces: true,
  lineHeight: 1.6,
  lineNumbers: 'off',
  minimap: { enabled: false },
  padding: { top: 8, bottom: 8 },
  renderWhitespace: 'selection',
  scrollBeyondLastLine: true,
  'semanticHighlighting.enabled': true,
  tabSize: 2
}
