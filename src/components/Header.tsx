'use client'

import ky from 'ky'
import { ActivityIcon, CogIcon, GlobeIcon, NetworkIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useUserQuery } from '~/apis/query'
import { LanguageToggle } from '~/components/LanguageToggle'
import { LogoText } from '~/components/LogoText'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { ModeToggle } from '~/components/ui/mode-toggle'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from '~/components/ui/navigation-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

const Header: FC = () => {
  const { t } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()
  const userQuery = useUserQuery()

  const navigationMenus = [
    { name: t('primitives.orchestrate'), route: '/orchestrate', Icon: ActivityIcon },
    { name: t('primitives.routing'), route: '/routing', Icon: NetworkIcon },
    { name: t('primitives.dns'), route: '/dns', Icon: GlobeIcon },
    { name: t('primitives.config'), route: '/config', Icon: CogIcon }
  ]

  return (
    <div className="flex w-full items-center justify-between p-2 sm:justify-center sm:p-4">
      <div className="hidden w-1/2 justify-start sm:block">
        <LogoText />
      </div>

      <div className="flex-shrink-0">
        <NavigationMenu>
          <NavigationMenuList className="flex items-center justify-center gap-0 space-x-0 sm:gap-6">
            {navigationMenus.map((menu, index) => (
              <NavigationMenuItem key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavigationMenuLink asChild active={menu.route === pathname}>
                      <Link className={navigationMenuTriggerStyle()} href={menu.route}>
                        <menu.Icon className="w-4 flex-shrink-0 sm:w-6" />
                      </Link>
                    </NavigationMenuLink>
                  </TooltipTrigger>

                  <TooltipContent>{menu.name}</TooltipContent>
                </Tooltip>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex w-1/2 items-center justify-end gap-2">
        <LanguageToggle />

        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
              {userQuery.data?.user.avatar && (
                <Image width={40} height={40} src={userQuery.data.user.avatar} alt="avatar" />
              )}

              <AvatarFallback>daed</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem>Account Settings</DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={async () => {
                await ky.post('/api/logout')

                router.replace('/login')
              }}
            >
              {t('actions.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
Header.displayName = 'Header'

export { Header }
