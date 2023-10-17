import Link from 'next/link'
import { FC } from 'react'

const LogoText: FC = () => {
  return (
    <Link
      className="rounded bg-gradient-to-b from-primary to-secondary bg-clip-text p-1 text-3xl font-extrabold text-transparent outline-0 transition-all duration-500 hover:text-primary focus:ring-2 focus:ring-primary"
      href="/"
    >
      daed
    </Link>
  )
}
LogoText.displayName = 'LogoText'

export { LogoText }
