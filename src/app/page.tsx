'use client'

import { signOut } from 'next-auth/react'
import { Button } from '~/components/ui/button'
import { ModeToggle } from '~/components/ui/mode-toggle'
import { useToast } from '~/components/ui/use-toast'

export default function Home() {
  const { toast } = useToast()

  return (
    <div>
      <ModeToggle />

      <Button onClick={() => toast({ title: 'Hello', description: 'Hello' })}>toast</Button>

      <Button onClick={() => signOut()}>sign out</Button>
    </div>
  )
}
