import { NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import { resolveAvatarPath } from '~/helpers/server/data'

export const POST = async (req: Request) => {
  const formData = await req.formData()
  const avatar = formData.get('avatar') as File

  const avatarPath = resolveAvatarPath(avatar.name)

  try {
    await fs.writeFile(avatarPath, Buffer.from(await avatar.arrayBuffer()))

    return NextResponse.json({ url: `/avatar/${avatar.name}` })
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 503 })
  }
}
