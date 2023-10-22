import envPaths from 'env-paths'
import fs from 'node:fs/promises'
import { resolveAvatarDataPath } from '~/helpers/server/data'

export const bootstrap = async () => {
  const { data } = envPaths('daed')

  await fs.mkdir(data, { recursive: true })
  await fs.mkdir(resolveAvatarDataPath(), { recursive: true })
}
