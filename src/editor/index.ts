import { loader } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { daeLang } from '~/editor/languages'

export const initializeEditor = async () => {
  self.MonacoEnvironment = {
    getWorker: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url))
  }

  const monaco = await import('monaco-editor')

  loader.config({ monaco })

  const monacoInstance = await loader.init()

  monacoInstance.languages.register({ id: 'dae', extensions: ['dae'] })
  monacoInstance.languages.setMonarchTokensProvider('dae', daeLang)

  const themeGithubLight = await import('monaco-themes/themes/GitHub Light.json')

  monacoInstance.editor.defineTheme('githubLight', themeGithubLight as editor.IStandaloneThemeData)
}
