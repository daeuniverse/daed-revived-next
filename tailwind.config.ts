import { nextui } from '@nextui-org/react'
import { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}', './src/**/*.{css,ts,tsx}'],
  plugins: [nextui()]
} satisfies Config
