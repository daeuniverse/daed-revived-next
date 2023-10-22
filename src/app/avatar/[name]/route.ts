import mime from 'mime'
import { NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import { resolveAvatarPath } from '~/helpers/server/data'

export const GET = async (_request: Request, { params }: { params: { name: string } }) => {
  const { name } = params
  const avatarPath = resolveAvatarPath(name)

  try {
    await fs.access(avatarPath, fs.constants.F_OK)

    const fileContent = await fs.readFile(avatarPath)
    const fileType = mime.getType(avatarPath) || ''

    return new NextResponse(fileContent, { headers: { 'Content-Type': fileType } })
  } catch {
    return new NextResponse(null, { status: 404 })
  }
}
