import Image from 'next/image'
import { FC } from 'react'
import { randomUnsplashImageURL } from '~/helpers'

export const RandomUnsplashImage: FC<{ sig: string }> = ({ sig }) => (
  <Image className="rounded-xl object-cover" width={1920} height={1080} src={randomUnsplashImageURL(sig)} alt={sig} />
)
