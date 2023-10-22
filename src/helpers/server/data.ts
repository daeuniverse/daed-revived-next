import envPaths from 'env-paths'
import path from 'node:path'

export const resolveAvatarDataPath = () => path.join(envPaths('daed').data, 'avatars')

export const resolveAvatarPath = (avatarName: string) => path.join(resolveAvatarDataPath(), avatarName)
