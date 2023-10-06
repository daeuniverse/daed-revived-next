import { FC } from 'react'

const LogoText: FC = () => {
  return (
    <a
      className="rounded bg-gradient-to-b from-primary to-secondary bg-clip-text p-1 text-2xl font-bold text-transparent outline-0 transition-all duration-500 hover:text-primary focus:ring-2 focus:ring-primary"
      href="https://github.com/daeuniverse/daed"
      target="_blank"
      rel="noreferrer"
    >
      daed
    </a>
  )
}
LogoText.displayName = 'LogoText'

export { LogoText }
