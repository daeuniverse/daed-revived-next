import Image from 'next/image'
import { FC } from 'react'
import { randomUnsplashImageURL } from '~/helpers'

const width = 512,
  height = 288

export const RandomUnsplashImage: FC<{ sig: string }> = ({ sig }) => (
  <Image
    className="mx-auto rounded-xl object-contain"
    width={width}
    height={height}
    src={randomUnsplashImageURL(sig, width, height)}
    alt={sig}
  />
)
