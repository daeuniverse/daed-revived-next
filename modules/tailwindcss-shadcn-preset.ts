import { Config } from 'tailwindcss'
import animatePlugin from 'tailwindcss-animate'
import shadcnPlugin from './tailwindcss-shadcn'

export default {
  content: [],
  plugins: [animatePlugin, shadcnPlugin]
} satisfies Config
