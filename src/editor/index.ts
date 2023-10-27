import { loader } from '@monaco-editor/react'
import type * as monaco from 'monaco-editor'
import { daeLang } from '~/editor/languages'

export const initializeEditor = async () => {
  const monacoInstance = await loader.init()

  monacoInstance.languages.register({ id: 'dae', extensions: ['dae'] })
  monacoInstance.languages.setMonarchTokensProvider('dae', daeLang)

  const themeGithubLight = await import('monaco-themes/themes/GitHub Light.json')

  monacoInstance.editor.defineTheme('githubLight', themeGithubLight as monaco.editor.IStandaloneThemeData)
}
